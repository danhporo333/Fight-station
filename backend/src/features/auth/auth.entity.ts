import type { AdminRole } from '@/shared/types/express';

/** Tài khoản quản trị trả ra API. Không bao giờ có passwordHash. */
export interface Admin {
  id: number;
  username: string;
  role: AdminRole;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
}

/** Phần `admin` trong response đăng nhập (API_SPEC.md mục 7.1) */
export type AdminSummary = Pick<Admin, 'id' | 'username' | 'role'>;

export interface LoginResult {
  accessToken: string;
  expiresIn: number;
  admin: AdminSummary;
}

/** Các cột được phép đọc ra; dùng làm `select` của Prisma */
export const ADMIN_SELECT = {
  id: true,
  username: true,
  role: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
} as const;

export function toAdminSummary(admin: Admin): AdminSummary {
  return { id: admin.id, username: admin.username, role: admin.role };
}
