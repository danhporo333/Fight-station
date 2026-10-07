import type { Shop } from '../types/shop.types'
import { getSocialLinks } from '../utils/shop.utils'
import { SocialIcon } from './SocialIcon'

interface ShopSocialLinksProps {
  shop: Shop
}

/** Ô vuông icon mạng xã hội kiểu prototype; link nào trống thì không hiện */
export function ShopSocialLinks({ shop }: ShopSocialLinksProps) {
  const links = getSocialLinks(shop)
  if (links.length === 0) return null

  return (
    <ul className="flex flex-wrap gap-3" aria-label="Mạng xã hội">
      {links.map((link) => (
        <li key={link.key}>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            title={link.label}
            className="flex size-[42px] items-center justify-center border border-brand-500/30 bg-card text-brand-500 transition hover:-translate-y-0.5 hover:bg-brand-500 hover:text-void hover:shadow-[0_5px_20px_rgb(255_106_0/0.5)]"
          >
            <SocialIcon network={link.key} />
          </a>
        </li>
      ))}
    </ul>
  )
}
