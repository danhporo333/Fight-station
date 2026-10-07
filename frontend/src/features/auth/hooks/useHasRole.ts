import { useAuthStore } from '@/shared/stores/auth.store'

import type { AdminRole } from '../types/auth.types'

/**
 * Admin đang đăng nhập có đúng role không. Chỉ để ẩn/hiện giao diện; quyền thật do backend kiểm tra
 * (staff gọi API của owner nhận `403 AUTH_005`).
 */
export function useHasRole(role: AdminRole): boolean {
  return useAuthStore((state) => state.admin?.role === role)
}
