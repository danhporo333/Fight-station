import { Hexagon, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router'

export interface PublicNavItem {
  to: string
  label: string
}

export interface PublicHeaderProps {
  navItems: PublicNavItem[]
  cta?: PublicNavItem
}

const LINK_CLASS =
  'relative py-1 text-sm font-semibold tracking-[0.15em] whitespace-nowrap uppercase transition-colors after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:bg-brand-500 after:transition-all hover:text-brand-500 hover:after:w-full'

const CTA_CLASS =
  'clip-skew inline-block bg-linear-135 from-neon-red to-neon-amber px-5 py-2 text-xs font-bold tracking-[0.15em] text-white uppercase transition hover:-translate-y-0.5'

/**
 * Header trang khách: logo, menu đầy đủ (từ 1024px) hoặc nút ☰ mở menu xổ xuống (điện thoại, máy tính
 * bảng), nút nổi bật
 */
export function PublicHeader({ navItems, cta }: PublicHeaderProps) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  const links = navItems.map((item) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.to === '/'}
      onClick={close}
      className={({ isActive }) =>
        `${LINK_CLASS} ${isActive ? 'text-brand-500 after:w-full' : 'text-ink after:w-0'}`
      }
    >
      {item.label}
    </NavLink>
  ))

  return (
    <header className="sticky top-0 z-20 border-b border-brand-500/30 bg-void/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link
          to="/"
          onClick={close}
          className="text-glow-strong flex shrink-0 items-center gap-2 font-display text-lg font-black tracking-[0.1em] text-brand-500 sm:text-xl"
        >
          <Hexagon aria-hidden="true" className="size-7" strokeWidth={2.5} />
          FIGHT STATION
        </Link>

        {/* Menu đầy đủ từ lg (1024px): logo + 5 mục + nút cần ~860px, ở md (768px, iPad dọc) bị tràn */}
        <div className="hidden items-center gap-8 lg:flex">
          <nav aria-label="Menu chính" className="flex gap-8 lg:gap-10">
            {links}
          </nav>
          {cta && (
            <Link to={cta.to} className={CTA_CLASS}>
              {cta.label}
            </Link>
          )}
        </div>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Đóng menu' : 'Mở menu'}
          onClick={() => setOpen((value) => !value)}
          className="p-1 text-brand-500 lg:hidden"
        >
          {open ? <X className="size-7" /> : <Menu className="size-7" />}
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t border-brand-500/20 bg-void/95 lg:hidden">
          <nav aria-label="Menu chính" className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5">
            {links}
            {cta && (
              <Link to={cta.to} onClick={close} className={`${CTA_CLASS} self-start`}>
                {cta.label}
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
