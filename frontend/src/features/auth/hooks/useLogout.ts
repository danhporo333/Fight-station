import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'

import { useAuthStore } from '@/shared/stores/auth.store'

/** Đăng xuất: xóa phiên và cache (không còn dữ liệu quản trị trong bộ nhớ), về trang đăng nhập */
export function useLogout(): () => void {
  const queryClient = useQueryClient()
  const clearSession = useAuthStore((state) => state.clearSession)
  const navigate = useNavigate()

  return () => {
    clearSession()
    queryClient.clear()
    toast.success('Đã đăng xuất')
    void navigate('/admin/login', { replace: true })
  }
}
