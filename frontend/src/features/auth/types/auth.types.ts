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
  isActive: boolean
  /** ISO 8601 UTC */
  lastLoginAt: string | null
  createdAt: string
}
