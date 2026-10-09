import { Menu, X } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
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

/** Danh sách link quản trị, dùng chung cho sidebar (máy tính) và ngăn kéo (điện thoại) */
function AdminNav({ items, onNavigate }: { items: AdminNavItem[]; onNavigate?: () => void }) {
  return (
    <nav aria-label="Menu quản trị" className="mt-6 flex flex-col gap-1">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
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
  )
}

/**
 * Khung trang quản trị: thanh trên, nội dung trang con, và menu.
 * - Máy tính (`md` trở lên): sidebar cố định bên trái, thu gọn được.
 * - Điện thoại: không có sidebar (chiếm hết chỗ của bảng, form); nút ☰ trên thanh trên mở menu dạng
 *   ngăn kéo trượt từ trái, đóng khi chọn mục, bấm ra ngoài hoặc nhấn Esc.
 */
export function AdminLayout({ navItems = [], showOwnerItems = false, actions }: AdminLayoutProps) {
  const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed)
  const toggleSidebar = useUiStore((state) => state.toggleSidebar)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const visibleItems = navItems.filter((item) => !item.ownerOnly || showOwnerItems)
  const closeDrawer = () => setDrawerOpen(false)

  // Esc đóng ngăn kéo
  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawerOpen])

  return (
    <div className="flex min-h-screen">
      <aside
        className={`hidden shrink-0 border-r border-neutral-800 bg-neutral-900 p-4 transition-all md:block ${
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
        {!sidebarCollapsed && <AdminNav items={visibleItems} />}
      </aside>

      {drawerOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Đóng menu"
            onClick={closeDrawer}
            className="absolute inset-0 bg-black/60"
          />
          <aside
            id="admin-drawer"
            className="relative h-full w-64 max-w-[80vw] overflow-y-auto border-r border-neutral-800 bg-neutral-900 p-4"
          >
            <div className="flex items-center justify-between">
              <span className="font-black text-brand-500">FS Admin</span>
              <button
                type="button"
                aria-label="Đóng menu"
                onClick={closeDrawer}
                className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>
            <AdminNav items={visibleItems} onNavigate={closeDrawer} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between gap-3 border-b border-neutral-800 px-4 md:justify-end md:px-6">
          <button
            type="button"
            aria-label="Mở menu quản trị"
            aria-expanded={drawerOpen}
            aria-controls="admin-drawer"
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2 rounded-lg p-1.5 font-black text-brand-500 hover:bg-neutral-800 md:hidden"
          >
            <Menu className="size-5" />
            FS Admin
          </button>
          {actions}
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
