import { z } from 'zod'

// Khớp backend/src/features/shop/shop.dto.ts (độ dài cột, thông báo). Ô trống là '' trong form,
// đổi thành null khi gửi (utils/shop.utils.ts → toShopPayload).
const optionalText = (max: number) => z.string().trim().max(max, `Tối đa ${max} ký tự`)

const optionalUrl = optionalText(500).refine(
  (value) => value === '' || z.url().safeParse(value).success,
  'Link không hợp lệ',
)

export const shopFormSchema = z.object({
  name: z.string().trim().min(1, 'Không được để trống').max(100, 'Tối đa 100 ký tự'),
  tagline: optionalText(500),
  hoursLabel: optionalText(50),
  hotline: optionalText(20),
  email: optionalText(255).refine(
    (value) => value === '' || z.email().safeParse(value).success,
    'Email không hợp lệ',
  ),
  facebookUrl: optionalUrl,
  zaloUrl: optionalUrl,
  tiktokUrl: optionalUrl,
  instagramUrl: optionalUrl,
  youtubeUrl: optionalUrl,
})

export type ShopFormInput = z.infer<typeof shopFormSchema>

/** Tên các ô, dùng cho applyServerErrors (gán `details` của COMMON_001 vào đúng ô) */
export const SHOP_FORM_FIELDS = shopFormSchema.keyof().options
