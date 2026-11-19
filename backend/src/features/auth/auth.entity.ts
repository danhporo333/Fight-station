import type { AdminRole } from '@/shared/types/express';

/** Tài khoản quản trị trả ra API. Không bao giờ có passwordHash. */
export interface Admin {
  id: number;
  username: string;
  /** Email khôi phục mật khẩu; null = chưa đặt */
  email: string | null;
  role: AdminRole;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
}

/** Thông tin guard cần để xác thực token. tokenVersion không trả ra API. */
export interface AdminSession {
  id: number;
  role: AdminRole;
  isActive: boolean;
  tokenVersion: number;
}

/** Phần `admin` trong response đăng nhập (API_SPEC.md mục 7.1) */
export type AdminSummary = Pick<Admin, 'id' | 'username' | 'role'>;

export interface TokenResult {
  accessToken: string;
  expiresIn: number;
}

export interface LoginResult extends TokenResult {
  admin: AdminSummary;
}

/** Các cột được phép đọc ra; dùng làm `select` của Prisma */
export const ADMIN_SELECT = {
  id: true,
  username: true,
  email: true,
  role: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
} as const;

export function toAdminSummary(admin: Admin): AdminSummary {
  return { id: admin.id, username: admin.username, role: admin.role };
}
