/** Thông tin quán, khớp response GET/PUT /shop (backend/src/features/shop/context.md) */
export interface Shop {
  id: number
  name: string
  tagline: string | null
  hoursLabel: string | null
  hotline: string | null
  email: string | null
  facebookUrl: string | null
  zaloUrl: string | null
  tiktokUrl: string | null
  instagramUrl: string | null
  youtubeUrl: string | null
  /** ISO 8601 UTC */
  updatedAt: string
}

/** Body PUT /shop: trường tùy chọn gửi `null` để xóa giá trị */
export type UpdateShopPayload = Partial<Omit<Shop, 'id' | 'updatedAt'>>

export type ShopSocialKey = 'facebookUrl' | 'zaloUrl' | 'tiktokUrl' | 'instagramUrl' | 'youtubeUrl'
