import { Hexagon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'

import { useShop } from '../hooks/useShop'
import { telHref } from '../utils/shop.utils'
import { ShopSocialLinks } from './ShopSocialLinks'

const YEAR = new Date().getFullYear()
const DEFAULT_NAME = 'Fight Station'

export interface FooterLink {
  to: string
  label: string
}

interface ShopFooterProps {
  /** Cột "Khám phá": link các trang công khai (app/routes.tsx truyền, thường là menu header) */
  links?: FooterLink[]
  /** Cột "Chi nhánh": nội dung do trang ghép truyền vào (feature branch), shop không import branch */
  branches?: ReactNode
}

const HEADING = 'mb-5 font-display text-sm tracking-[0.15em] text-brand-500 uppercase'
// py-1: vùng bấm cao ~29px trên điện thoại (chữ 21px quá khó bấm); gap danh sách giảm tương ứng
const LINK = 'inline-block py-1 text-muted transition-colors hover:text-brand-500'

/**
 * Footer trang khách theo prototype: 4 cột (giới thiệu quán + mạng xã hội · Khám phá · Chi nhánh ·
 * Liên hệ) và dòng bản quyền. Thông tin quán lỗi/chưa có (SHOP_001) thì vẫn hiện khung với tên mặc định.
 */
export function ShopFooter({ links = [], branches }: ShopFooterProps) {
  const { data: shop } = useShop()
  const name = shop?.name ?? DEFAULT_NAME

  return (
    <footer className="border-t border-brand-500/20 bg-dark pt-16 pb-8">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] lg:gap-12">
          <div className="flex flex-col gap-4">
            <Link
              to="/"
              className="text-glow-strong flex items-center gap-2 font-display text-xl font-black tracking-[0.1em] text-brand-500 uppercase"
            >
              <Hexagon aria-hidden="true" className="size-7" strokeWidth={2.5} />
              {name}
            </Link>
            {shop?.tagline && <p className="max-w-sm text-muted">{shop.tagline}</p>}
            {shop && <ShopSocialLinks shop={shop} />}
          </div>

          {links.length > 0 && (
            <nav aria-label="Khám phá">
              <h2 className={HEADING}>Khám phá</h2>
              <ul className="flex flex-col gap-0.5">
                {links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className={LINK}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {branches && (
            <div>
              <h2 className={HEADING}>Chi nhánh</h2>
              {branches}
            </div>
          )}

          {shop && (
            <div>
              <h2 className={HEADING}>Liên hệ</h2>
              <ul className="flex flex-col gap-0.5">
                {shop.facebookUrl && (
                  <li>
                    <a
                      href={shop.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={LINK}
                    >
                      Fanpage Facebook
                    </a>
                  </li>
                )}
                {shop.zaloUrl && (
                  <li>
                    <a
                      href={shop.zaloUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={LINK}
                    >
                      Zalo quán
                    </a>
                  </li>
                )}
                {shop.hotline && (
                  <li>
                    <a href={telHref(shop.hotline)} className={LINK}>
                      {shop.hotline}
                    </a>
                  </li>
                )}
                {shop.email && (
                  <li>
                    <a href={`mailto:${shop.email}`} className={`${LINK} break-all`}>
                      {shop.email}
                    </a>
                  </li>
                )}
                {shop.hoursLabel && <li className="py-1 text-muted">Mở cửa {shop.hoursLabel}</li>}
              </ul>
            </div>
          )}
        </div>

        <p className="border-t border-brand-500/10 pt-8 text-center font-mono text-xs tracking-[0.1em] text-muted">
          © {YEAR} <span className="text-brand-500 uppercase">{name}</span> — All rights reserved.
        </p>
      </div>
    </footer>
  )
}
