import { Clock, Mail, Phone } from 'lucide-react'

import { useShop } from '../hooks/useShop'
import { telHref } from '../utils/shop.utils'
import { ShopSocialLinks } from './ShopSocialLinks'

const YEAR = new Date().getFullYear()

/**
 * Footer trang công khai: liên hệ, giờ mở cửa, mạng xã hội. Đang tải, lỗi (kể cả SHOP_001 chưa seed)
 * hay mất mạng thì chỉ hiện dòng bản quyền, không làm vỡ trang.
 */
export function ShopFooter() {
  const { data: shop } = useShop()

  return (
    <footer className="border-t border-brand-500/20 bg-dark">
      {shop && (
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2">
          <div className="flex flex-col gap-3">
            <p className="text-glow font-display text-lg font-black tracking-[0.1em] text-brand-500">
              {shop.name}
            </p>
            <ShopSocialLinks shop={shop} />
          </div>

          <ul className="flex flex-col gap-2 text-sm text-ink">
            {shop.hotline && (
              <li className="flex items-center gap-2">
                <Phone aria-hidden="true" className="size-4 text-brand-500" />
                <a href={telHref(shop.hotline)} className="hover:text-brand-400">
                  {shop.hotline}
                </a>
              </li>
            )}
            {shop.email && (
              <li className="flex items-center gap-2">
                <Mail aria-hidden="true" className="size-4 text-brand-500" />
                <a href={`mailto:${shop.email}`} className="hover:text-brand-400">
                  {shop.email}
                </a>
              </li>
            )}
            {shop.hoursLabel && (
              <li className="flex items-center gap-2">
                <Clock aria-hidden="true" className="size-4 text-brand-500" />
                <span>Mở cửa {shop.hoursLabel}</span>
              </li>
            )}
          </ul>
        </div>
      )}

      <p className="border-t border-brand-500/10 py-4 text-center font-mono text-xs text-muted">
        © {YEAR} {shop?.name ?? 'Fight Station'}
      </p>
    </footer>
  )
}
