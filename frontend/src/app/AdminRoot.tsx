import { AdminUserMenu, RequireAuth, useHasRole } from '@/features/auth'
import { AdminLayout, type AdminNavItem } from '@/shared/components/layout/AdminLayout'

// Menu quản trị: mỗi feature có trang admin thì thêm một dòng (ownerOnly cho trang chỉ owner vào)
const ADMIN_NAV: AdminNavItem[] = [
  { to: '/admin/games', label: 'Game' },
  { to: '/admin/game-categories', label: 'Thể loại game' },
  { to: '/admin/menu', label: 'Menu' },
  { to: '/admin/menu-categories', label: 'Nhóm menu' },
  { to: '/admin/shop', label: 'Thông tin quán', ownerOnly: true },
  { to: '/admin/branches', label: 'Chi nhánh', ownerOnly: true },
  { to: '/admin/account', label: 'Tài khoản' },
]

/** Gốc nhánh /admin: chặn khi chưa đăng nhập, ghép layout với menu và khu tài khoản của feature auth */
export function AdminRoot() {
  const isOwner = useHasRole('owner')

  return (
    <RequireAuth>
      <AdminLayout navItems={ADMIN_NAV} showOwnerItems={isOwner} actions={<AdminUserMenu />} />
    </RequireAuth>
  )
}
