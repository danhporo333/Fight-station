import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AdminRole = 'owner' | 'staff'

export interface AuthAdmin {
  id: number
  username: string
  role: AdminRole
}

interface AuthState {
  accessToken: string | null
  admin: AuthAdmin | null
  setSession: (accessToken: string, admin: AuthAdmin) => void
  /** Thay token, giữ nguyên admin (sau khi đổi mật khẩu token cũ hết hiệu lực) */
  setAccessToken: (accessToken: string) => void
  clearSession: () => void
}

// Đặt ở shared (không ở features/auth) vì http.ts cần đọc token mà shared không được import features.
// Lưu localStorage key `fs-auth`; token sống 1 ngày theo API.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      admin: null,
      setSession: (accessToken, admin) => set({ accessToken, admin }),
      setAccessToken: (accessToken) => set({ accessToken }),
      clearSession: () => set({ accessToken: null, admin: null }),
    }),
    {
      name: 'fs-auth',
      partialize: ({ accessToken, admin }) => ({ accessToken, admin }),
    },
  ),
)
