import type { ReactNode } from 'react'
import { Link, Outlet } from 'react-router'

export interface PublicLayoutProps {
  /** Footer; app/routes.tsx truyền vào (shared không import features). Không truyền thì hiện dòng bản quyền. */
  footer?: ReactNode
}

/** Khung trang cho khách: header, nội dung trang con (<Outlet />), footer. Menu điều hướng thêm khi có feature. */
export function PublicLayout({ footer }: PublicLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4">
          <Link to="/" className="text-xl font-black tracking-tight text-brand-500">
            FIGHT STATION
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {footer ?? (
        <footer className="border-t border-neutral-800 py-6 text-center text-sm text-neutral-500">
          © {new Date().getFullYear()} Fight Station
        </footer>
      )}
    </div>
  )
}
