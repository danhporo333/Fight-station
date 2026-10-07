import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'

import { useAuthStore } from '@/shared/stores/auth.store'

export interface RequireAuthProps {
  children: ReactNode
}

/**
 * Chặn route quản trị khi chưa đăng nhập: chuyển về `/admin/login?next=<trang đang mở>`.
 * Chỉ kiểm tra có token; token hết hạn sẽ bị API trả AUTH_003 và xử lý qua sự kiện `auth:expired`.
 */
export function RequireAuth({ children }: RequireAuthProps) {
  const hasToken = useAuthStore((state) => state.accessToken !== null)
  const location = useLocation()

  if (!hasToken) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/admin/login?next=${next}`} replace />
  }
  return children
}
