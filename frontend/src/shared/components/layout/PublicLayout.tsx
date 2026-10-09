import type { ReactNode } from 'react'
import { Outlet, ScrollRestoration } from 'react-router'

import { PublicHeader, type PublicNavItem } from './PublicHeader'

export type { PublicNavItem } from './PublicHeader'

export interface PublicLayoutProps {
  /** Menu trên header; app/routes.tsx truyền vào (shared không import features) */
  navItems?: PublicNavItem[]
  /** Nút nổi bật bên phải header (vd "Liên hệ") */
  cta?: PublicNavItem
  /** Footer; app/routes.tsx truyền vào. Không truyền thì hiện dòng bản quyền. */
  footer?: ReactNode
}

/** Khung trang cho khách: nền lưới neon, header + menu, nội dung trang con (<Outlet />), footer */
export function PublicLayout({ navItems = [], cta, footer }: PublicLayoutProps) {
  return (
    <div className="neon-backdrop isolate flex min-h-screen flex-col">
      {/* Đổi trang thì cuộn lên đầu; quay lại thì về chỗ cũ. Khóa theo đường dẫn để đổi ?page=, ?q= trên cùng trang không bị kéo lên đầu */}
      <ScrollRestoration getKey={(location) => location.pathname} />
      <PublicHeader navItems={navItems} cta={cta} />

      <main className="flex-1">
        <Outlet />
      </main>

      {footer ?? (
        <footer className="border-t border-brand-500/20 py-6 text-center text-sm text-muted">
          © {new Date().getFullYear()} Fight Station
        </footer>
      )}
    </div>
  )
}
