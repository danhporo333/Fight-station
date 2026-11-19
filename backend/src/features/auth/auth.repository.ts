import type { Database } from '@/core/database/prisma';

import { ADMIN_SELECT, type Admin, type AdminSession } from './auth.entity';

export interface ResetTokenRecord {
  id: number;
  adminUserId: number;
  expiresAt: Date;
  usedAt: Date | null;
}

export class AuthRepository {
  constructor(private readonly db: Database) {}

  findById(id: number): Promise<Admin | null> {
    return this.db.adminUser.findUnique({ where: { id }, select: ADMIN_SELECT });
  }

  findSessionById(id: number): Promise<AdminSession | null> {
    return this.db.adminUser.findUnique({
      where: { id },
      select: { id: true, role: true, isActive: true, tokenVersion: true },
    });
  }

  /** Chỉ dùng khi cần so mật khẩu; passwordHash không bao giờ rời khỏi service */
  async findCredentialsByUsername(
    username: string,
  ): Promise<{ admin: Admin; passwordHash: string; tokenVersion: number } | null> {
    const row = await this.db.adminUser.findUnique({
      where: { username },
      select: { ...ADMIN_SELECT, passwordHash: true, tokenVersion: true },
    });
    if (!row) return null;
    const { passwordHash, tokenVersion, ...admin } = row;
    return { admin, passwordHash, tokenVersion };
  }

  async findPasswordHashById(id: number): Promise<string | null> {
    const row = await this.db.adminUser.findUnique({
      where: { id },
      select: { passwordHash: true },
    });
    return row?.passwordHash ?? null;
  }

  async updateLastLogin(id: number, at: Date): Promise<void> {
    await this.db.adminUser.update({ where: { id }, data: { lastLoginAt: at } });
  }

  /** Đổi mật khẩu và tăng tokenVersion (đăng xuất mọi thiết bị). Trả tokenVersion mới. */
  async updatePasswordHash(id: number, passwordHash: string): Promise<number> {
    const row = await this.db.adminUser.update({
      where: { id },
      data: { passwordHash, tokenVersion: { increment: 1 } },
      select: { tokenVersion: true },
    });
    return row.tokenVersion;
  }

  async findIdByEmail(email: string): Promise<number | null> {
    const row = await this.db.adminUser.findUnique({ where: { email }, select: { id: true } });
    return row?.id ?? null;
  }

  async updateEmail(id: number, email: string | null): Promise<void> {
    await this.db.adminUser.update({ where: { id }, data: { email } });
  }

  /** Tìm tài khoản để gửi link đặt lại: theo tên đăng nhập hoặc email */
  findForReset(identifier: string): Promise<{
    id: number;
    email: string | null;
    isActive: boolean;
  } | null> {
    return this.db.adminUser.findFirst({
      where: { OR: [{ username: identifier }, { email: identifier }] },
      select: { id: true, email: true, isActive: true },
    });
  }

  /** Mỗi tài khoản chỉ giữ một token còn hiệu lực: xoá token cũ rồi tạo token mới */
  async createResetToken(adminUserId: number, tokenHash: string, expiresAt: Date): Promise<void> {
    await this.db.$transaction([
      this.db.passwordResetToken.deleteMany({ where: { adminUserId } }),
      this.db.passwordResetToken.create({ data: { adminUserId, tokenHash, expiresAt } }),
    ]);
  }

  findResetToken(tokenHash: string): Promise<ResetTokenRecord | null> {
    return this.db.passwordResetToken.findUnique({
      where: { tokenHash },
      select: { id: true, adminUserId: true, expiresAt: true, usedAt: true },
    });
  }

  /**
   * Dùng token và đặt mật khẩu mới trong một transaction. Token chỉ "thắng" một lần
   * (updateMany có điều kiện usedAt null) nên hai request song song không cùng đặt lại được.
   * Trả false nếu token đã bị dùng.
   */
  async consumeResetToken(
    tokenId: number,
    adminUserId: number,
    passwordHash: string,
    now: Date,
  ): Promise<boolean> {
    return this.db.$transaction(async (tx) => {
      const claimed = await tx.passwordResetToken.updateMany({
        where: { id: tokenId, usedAt: null, expiresAt: { gt: now } },
        data: { usedAt: now },
      });
      if (claimed.count !== 1) return false;
      await tx.adminUser.update({
        where: { id: adminUserId },
        data: { passwordHash, tokenVersion: { increment: 1 } },
      });
      // Các token còn lại của tài khoản này không còn dùng được nữa
      await tx.passwordResetToken.deleteMany({ where: { adminUserId, id: { not: tokenId } } });
      return true;
    });
  }
}
