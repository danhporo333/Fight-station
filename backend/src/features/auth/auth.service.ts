import { createHash, randomBytes } from 'node:crypto';

import { config } from '@/config';
import { sendMail } from '@/core/mailer';
import { logger } from '@/core/logger';
import {
  BadRequestError,
  ConflictError,
  ErrorCode,
  ForbiddenError,
  UnauthorizedError,
  ValidationError,
} from '@/shared/errors';
import type { AdminLookup } from '@/shared/middlewares';
import type { AdminRole } from '@/shared/types/express';
import { signAccessToken } from '@/shared/utils/jwt';
import { hashPassword, verifyPassword } from '@/shared/utils/password';

import type {
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  ResetPasswordDto,
  UpdateEmailDto,
} from './auth.dto';
import {
  toAdminSummary,
  type Admin,
  type AdminSession,
  type LoginResult,
  type TokenResult,
} from './auth.entity';
import type { AuthRepository } from './auth.repository';

function hashResetToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

const INVALID_RESET_TOKEN_MESSAGE = 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn';

/** Thỏa AdminLookup nên app.ts truyền thẳng vào createAuthGuards() */
export class AuthService implements AdminLookup {
  constructor(private readonly repo: AuthRepository) {}

  findById(id: number): Promise<AdminSession | null> {
    return this.repo.findSessionById(id);
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
    const { admin, tokenVersion } = credentials;
    if (!admin.isActive) {
      throw new ForbiddenError(ErrorCode.AUTH_ACCOUNT_LOCKED, 'Tài khoản đã bị khóa');
    }

    await this.repo.updateLastLogin(admin.id, new Date());
    const { accessToken, expiresIn } = signAccessToken({
      sub: admin.id,
      role: admin.role,
      tokenVersion,
    });
    logger.info({ adminId: admin.id }, 'auth.login');
    return { accessToken, expiresIn, admin: toAdminSummary(admin) };
  }

  async getMe(adminId: number): Promise<Admin> {
    const admin = await this.repo.findById(adminId);
    if (!admin) throw new UnauthorizedError(ErrorCode.AUTH_INVALID_TOKEN, 'Token không hợp lệ');
    return admin;
  }

  /**
   * Đổi mật khẩu xong tokenVersion tăng nên token đang dùng cũng hết hiệu lực;
   * trả token mới để thiết bị đang đổi không bị đăng xuất.
   */
  async changePassword(
    adminId: number,
    role: AdminRole,
    dto: ChangePasswordDto,
  ): Promise<TokenResult> {
    const currentHash = await this.repo.findPasswordHashById(adminId);
    if (!currentHash) {
      throw new UnauthorizedError(ErrorCode.AUTH_INVALID_TOKEN, 'Token không hợp lệ');
    }
    if (!(await verifyPassword(currentHash, dto.currentPassword))) {
      throw new ValidationError([
        { field: 'currentPassword', message: 'Mật khẩu hiện tại không đúng' },
      ]);
    }
    const tokenVersion = await this.repo.updatePasswordHash(
      adminId,
      await hashPassword(dto.newPassword),
    );
    logger.info({ adminId }, 'auth.password_changed');
    return signAccessToken({ sub: adminId, role, tokenVersion });
  }

  /** Đặt hoặc xoá email khôi phục của chính mình (cần mật khẩu hiện tại) */
  async updateEmail(adminId: number, dto: UpdateEmailDto): Promise<Admin> {
    const currentHash = await this.repo.findPasswordHashById(adminId);
    if (!currentHash) {
      throw new UnauthorizedError(ErrorCode.AUTH_INVALID_TOKEN, 'Token không hợp lệ');
    }
    if (!(await verifyPassword(currentHash, dto.currentPassword))) {
      throw new ValidationError([
        { field: 'currentPassword', message: 'Mật khẩu hiện tại không đúng' },
      ]);
    }

    if (dto.email !== null) {
      const ownerId = await this.repo.findIdByEmail(dto.email);
      if (ownerId !== null && ownerId !== adminId) {
        throw new ConflictError(ErrorCode.AUTH_EMAIL_TAKEN, 'Email này đã được tài khoản khác dùng');
      }
    }
    await this.repo.updateEmail(adminId, dto.email);
    logger.info({ adminId }, 'auth.email_updated');
    return this.getMe(adminId);
  }

  /**
   * Luôn trả thành công dù tài khoản có tồn tại, có email hay không, để không lộ thông tin.
   * Lỗi gửi mail chỉ ghi log, không báo cho người gọi vì cùng lý do.
   */
  async forgotPassword({ identifier }: ForgotPasswordDto): Promise<void> {
    // Collation utf8mb4_0900_ai_ci không phân biệt hoa thường nên không cần chuẩn hoá identifier
    const target = await this.repo.findForReset(identifier);
    if (!target?.email || !target.isActive) {
      logger.info('auth.forgot_password_ignored');
      return;
    }

    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + config.passwordReset.tokenTtlMinutes * 60 * 1000);
    await this.repo.createResetToken(target.id, hashResetToken(token), expiresAt);

    const link = `${config.passwordReset.frontendUrl}/admin/reset-password?token=${encodeURIComponent(token)}`;
    const minutes = config.passwordReset.tokenTtlMinutes;
    try {
      await sendMail({
        to: target.email,
        subject: 'Đặt lại mật khẩu quản trị Fight Station',
        text:
          `Bạn (hoặc ai đó) vừa yêu cầu đặt lại mật khẩu quản trị.\n\n` +
          `Mở link sau để đặt mật khẩu mới (hiệu lực ${minutes} phút, dùng được một lần):\n${link}\n\n` +
          `Nếu không phải bạn yêu cầu, hãy bỏ qua email này, mật khẩu cũ vẫn giữ nguyên.`,
        html:
          `<p>Bạn (hoặc ai đó) vừa yêu cầu đặt lại mật khẩu quản trị.</p>` +
          `<p><a href="${link}">Đặt mật khẩu mới</a></p>` +
          `<p>Link có hiệu lực ${minutes} phút và chỉ dùng được một lần.</p>` +
          `<p>Nếu không phải bạn yêu cầu, hãy bỏ qua email này, mật khẩu cũ vẫn giữ nguyên.</p>`,
      });
      logger.info({ adminId: target.id }, 'auth.forgot_password_sent');
    } catch (err) {
      logger.error({ err, adminId: target.id }, 'auth.forgot_password_mail_failed');
    }
  }

  async resetPassword({ token, newPassword }: ResetPasswordDto): Promise<void> {
    const record = await this.repo.findResetToken(hashResetToken(token));
    const now = new Date();
    if (!record || record.usedAt !== null || record.expiresAt <= now) {
      throw new BadRequestError(ErrorCode.AUTH_RESET_TOKEN_INVALID, INVALID_RESET_TOKEN_MESSAGE);
    }

    const consumed = await this.repo.consumeResetToken(
      record.id,
      record.adminUserId,
      await hashPassword(newPassword),
      now,
    );
    if (!consumed) {
      throw new BadRequestError(ErrorCode.AUTH_RESET_TOKEN_INVALID, INVALID_RESET_TOKEN_MESSAGE);
    }
    logger.info({ adminId: record.adminUserId }, 'auth.password_reset');
  }
}
