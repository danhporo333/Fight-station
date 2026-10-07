import { AdminUserMenu, RequireAuth, useHasRole } from '@/features/auth'
import { AdminLayout, type AdminNavItem } from '@/shared/components/layout/AdminLayout'

// Menu quản trị: mỗi feature có trang admin thì thêm một dòng (ownerOnly cho trang chỉ owner vào)
const ADMIN_NAV: AdminNavItem[] = [{ to: '/admin/account', label: 'Tài khoản' }]

/** Gốc nhánh /admin: chặn khi chưa đăng nhập, ghép layout với menu và khu tài khoản của feature auth */
export function AdminRoot() {
  const isOwner = useHasRole('owner')

  return (
    <RequireAuth>
      <AdminLayout navItems={ADMIN_NAV} showOwnerItems={isOwner} actions={<AdminUserMenu />} />
    </RequireAuth>
  )
}
