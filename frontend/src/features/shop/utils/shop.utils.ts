import type { ShopFormInput } from '../types/shop.schema'
import type { Shop, ShopSocialKey, UpdateShopPayload } from '../types/shop.types'

const SOCIAL_LABELS: Record<ShopSocialKey, string> = {
  facebookUrl: 'Facebook',
  zaloUrl: 'Zalo',
  tiktokUrl: 'TikTok',
  instagramUrl: 'Instagram',
  youtubeUrl: 'YouTube',
}

export interface SocialLink {
  key: ShopSocialKey
  label: string
  url: string
}

/** Link mạng xã hội có giá trị (link trống thì ẩn, không hiện link hỏng) */
export function getSocialLinks(shop: Shop): SocialLink[] {
  return (Object.keys(SOCIAL_LABELS) as ShopSocialKey[]).flatMap((key) => {
    const url = shop[key]
    return url ? [{ key, label: SOCIAL_LABELS[key], url }] : []
  })
}

/** Nhãn ô nhập trong form quản trị */
export function socialLabel(key: ShopSocialKey): string {
  return SOCIAL_LABELS[key]
}

export const SOCIAL_KEYS = Object.keys(SOCIAL_LABELS) as ShopSocialKey[]

/** Shop từ API → giá trị form (null → '') */
export function toShopFormValues(shop: Shop): ShopFormInput {
  return {
    name: shop.name,
    tagline: shop.tagline ?? '',
    hoursLabel: shop.hoursLabel ?? '',
    hotline: shop.hotline ?? '',
    email: shop.email ?? '',
    facebookUrl: shop.facebookUrl ?? '',
    zaloUrl: shop.zaloUrl ?? '',
    tiktokUrl: shop.tiktokUrl ?? '',
    instagramUrl: shop.instagramUrl ?? '',
    youtubeUrl: shop.youtubeUrl ?? '',
  }
}

/** Giá trị form → body PUT /shop (ô trống → null, API dùng null để xóa giá trị) */
export function toShopPayload({ name, ...optional }: ShopFormInput): UpdateShopPayload {
  const payload: UpdateShopPayload = { name }
  for (const [key, value] of Object.entries(optional) as [keyof typeof optional, string][]) {
    payload[key] = value === '' ? null : value
  }
  return payload
}

/** Đường dẫn gọi điện: bỏ khoảng trắng và dấu chấm ("0901 234 567" → "tel:0901234567") */
export function telHref(hotline: string): string {
  return `tel:${hotline.replace(/[\s.]/g, '')}`
}
