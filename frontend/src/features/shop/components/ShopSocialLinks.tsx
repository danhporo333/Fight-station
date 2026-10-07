import type { Shop } from '../types/shop.types'
import { getSocialLinks } from '../utils/shop.utils'

interface ShopSocialLinksProps {
  shop: Shop
}

/** Nút link mạng xã hội; link nào trống thì không hiện */
export function ShopSocialLinks({ shop }: ShopSocialLinksProps) {
  const links = getSocialLinks(shop)
  if (links.length === 0) return null

  return (
    <ul className="flex flex-wrap gap-2" aria-label="Mạng xã hội">
      {links.map((link) => (
        <li key={link.key}>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-full border border-neutral-700 px-3 py-1 text-xs font-semibold text-neutral-300 transition-colors hover:border-brand-500 hover:text-brand-400"
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  )
}
