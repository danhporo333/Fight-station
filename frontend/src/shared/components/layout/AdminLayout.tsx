import type { ReactNode } from 'react'
import { NavLink, Outlet } from 'react-router'

import { useUiStore } from '@/shared/stores/ui.store'

export interface AdminNavItem {
  to: string
  label: string
  /** Chỉ hiện với role này (vd 'owner'); để trống = mọi admin */
  ownerOnly?: boolean
}

export interface AdminLayoutProps {
  /** Menu bên trái; app/routes.tsx truyền vào (shared không import features) */
  navItems?: AdminNavItem[]
  /** Có hiện mục ownerOnly không (thường là role === 'owner') */
  showOwnerItems?: boolean
  /** Vùng góc trên bên phải: tên tài khoản, nút đăng xuất... */
  actions?: ReactNode
}

/** Khung trang quản trị: sidebar (thu gọn được), thanh trên và nội dung trang con */
export function AdminLayout({ navItems = [], showOwnerItems = false, actions }: AdminLayoutProps) {
  const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed)
  const toggleSidebar = useUiStore((state) => state.toggleSidebar)
  const visibleItems = navItems.filter((item) => !item.ownerOnly || showOwnerItems)

  return (
    <div className="flex min-h-screen">
      <aside
        className={`shrink-0 border-r border-neutral-800 bg-neutral-900 p-4 transition-all ${
          sidebarCollapsed ? 'w-16' : 'w-60'
        }`}
      >
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
          className="font-black text-brand-500"
        >
          {sidebarCollapsed ? 'FS' : 'FS Admin'}
        </button>

        {!sidebarCollapsed && (
          <nav aria-label="Menu quản trị" className="mt-6 flex flex-col gap-1">
            {visibleItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm ${
                    isActive
                      ? 'bg-brand-600/15 font-semibold text-brand-400'
                      : 'text-neutral-300 hover:bg-neutral-800'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-end border-b border-neutral-800 px-6">
          {actions}
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
