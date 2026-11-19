import type { AdminRole, AuthAdmin } from '@/shared/stores/auth.store'

export type { AdminRole, AuthAdmin }

/** `POST /auth/login` → data (API_SPEC.md mục 7.1) */
export interface LoginResult {
  accessToken: string
  /** Số giây token còn hiệu lực (mặc định 86400) */
  expiresIn: number
  admin: AuthAdmin
}

/** `GET /auth/me` → data */
export interface CurrentAdmin extends AuthAdmin {
  /** Email khôi phục mật khẩu; null = chưa đặt */
  email: string | null
  isActive: boolean
  /** ISO 8601 UTC */
  lastLoginAt: string | null
  createdAt: string
}

/** `PUT /auth/password` → data: token mới (token cũ hết hiệu lực vì mật khẩu đã đổi) */
export interface TokenResult {
  accessToken: string
  expiresIn: number
}
