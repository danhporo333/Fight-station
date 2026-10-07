import type { Database } from '@/core/database/prisma';

import { ADMIN_SELECT, type Admin } from './auth.entity';

export class AuthRepository {
  constructor(private readonly db: Database) {}

  findById(id: number): Promise<Admin | null> {
    return this.db.adminUser.findUnique({ where: { id }, select: ADMIN_SELECT });
  }

  /** Chỉ dùng khi cần so mật khẩu; passwordHash không bao giờ rời khỏi service */
  async findCredentialsByUsername(
    username: string,
  ): Promise<{ admin: Admin; passwordHash: string } | null> {
    const row = await this.db.adminUser.findUnique({
      where: { username },
      select: { ...ADMIN_SELECT, passwordHash: true },
    });
    if (!row) return null;
    const { passwordHash, ...admin } = row;
    return { admin, passwordHash };
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

  async updatePasswordHash(id: number, passwordHash: string): Promise<void> {
    await this.db.adminUser.update({ where: { id }, data: { passwordHash } });
  }
}
