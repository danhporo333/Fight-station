import { logger } from '@/core/logger';
import { ErrorCode, ForbiddenError, UnauthorizedError, ValidationError } from '@/shared/errors';
import type { AdminLookup } from '@/shared/middlewares';
import { signAccessToken } from '@/shared/utils/jwt';
import { hashPassword, verifyPassword } from '@/shared/utils/password';

import type { ChangePasswordDto, LoginDto } from './auth.dto';
import { toAdminSummary, type Admin, type LoginResult } from './auth.entity';
import type { AuthRepository } from './auth.repository';

/** Thỏa AdminLookup nên app.ts truyền thẳng vào createAuthGuards() */
export class AuthService implements AdminLookup {
  constructor(private readonly repo: AuthRepository) {}

  findById(id: number): Promise<Admin | null> {
    return this.repo.findById(id);
  }

  async login({ username, password }: LoginDto): Promise<LoginResult> {
    const credentials = await this.repo.findCredentialsByUsername(username);
    // Luôn verify (kể cả khi không có tài khoản) để không lộ username nào tồn tại
    const passwordOk = await verifyPassword(credentials?.passwordHash ?? null, password);
    if (!credentials || !passwordOk) {
      logger.warn({ username }, 'auth.login_failed');
      throw new UnauthorizedError(
        ErrorCode.AUTH_INVALID_CREDENTIALS,
        'Tên đăng nhập hoặc mật khẩu không đúng',
      );
    }

    // Kiểm tra khóa SAU khi đúng mật khẩu: người không biết mật khẩu không biết tài khoản bị khóa
    const { admin } = credentials;
    if (!admin.isActive) {
      throw new ForbiddenError(ErrorCode.AUTH_ACCOUNT_LOCKED, 'Tài khoản đã bị khóa');
    }

    await this.repo.updateLastLogin(admin.id, new Date());
    const { accessToken, expiresIn } = signAccessToken({ sub: admin.id, role: admin.role });
    logger.info({ adminId: admin.id }, 'auth.login');
    return { accessToken, expiresIn, admin: toAdminSummary(admin) };
  }

  async getMe(adminId: number): Promise<Admin> {
    const admin = await this.repo.findById(adminId);
    if (!admin) throw new UnauthorizedError(ErrorCode.AUTH_INVALID_TOKEN, 'Token không hợp lệ');
    return admin;
  }

  async changePassword(adminId: number, dto: ChangePasswordDto): Promise<void> {
    const currentHash = await this.repo.findPasswordHashById(adminId);
    if (!currentHash) {
      throw new UnauthorizedError(ErrorCode.AUTH_INVALID_TOKEN, 'Token không hợp lệ');
    }
    if (!(await verifyPassword(currentHash, dto.currentPassword))) {
      throw new ValidationError([
        { field: 'currentPassword', message: 'Mật khẩu hiện tại không đúng' },
      ]);
    }
    await this.repo.updatePasswordHash(adminId, await hashPassword(dto.newPassword));
    logger.info({ adminId }, 'auth.password_changed');
  }
}
