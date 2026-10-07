import { Link } from 'react-router'

import { Button } from '@/shared/components/ui/Button'
import { useAuthStore } from '@/shared/stores/auth.store'

import { useCurrentAdmin } from '../hooks/useCurrentAdmin'
import { useLogout } from '../hooks/useLogout'
import { ROLE_LABEL } from '../utils/auth.utils'

/**
 * Góc trên trang quản trị: tên, vai trò, đăng xuất. Gọi `/auth/me` để phát hiện sớm token hết hạn
 * hoặc tài khoản bị khóa; trong lúc chờ thì hiện thông tin đã lưu khi đăng nhập.
 */
export function AdminUserMenu() {
  const storedAdmin = useAuthStore((state) => state.admin)
  const { data } = useCurrentAdmin()
  const logout = useLogout()
  const admin = data?.data ?? storedAdmin

  if (!admin) return null

  return (
    <div className="flex items-center gap-3">
      <Link to="/admin/account" className="text-right leading-tight hover:text-brand-400">
        <span className="block text-sm font-semibold">{admin.username}</span>
        <span className="block text-xs text-neutral-400">{ROLE_LABEL[admin.role]}</span>
      </Link>
      <Button variant="ghost" onClick={logout}>
        Đăng xuất
      </Button>
    </div>
  )
}
