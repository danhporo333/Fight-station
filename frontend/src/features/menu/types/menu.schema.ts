import { z } from 'zod'

// Khớp backend menu-item.dto.ts / menu-category.dto.ts. Ô nhập luôn là chuỗi; đổi sang số và null khi
// gửi (utils/menu.utils.ts → toMenuItemPayload, toMenuCategoryPayload).

const sortOrder = z
  .string()
  .trim()
  .regex(/^-?\d+$/, 'Phải là số nguyên')

export const menuItemFormSchema = z.object({
  /** Giá trị ô chọn là chuỗi id; '' = chưa chọn */
  menuCategoryId: z.string().min(1, 'Chọn nhóm menu'),
  name: z.string().trim().min(1, 'Không được để trống').max(150, 'Tối đa 150 ký tự'),
  description: z.string().trim().max(255, 'Tối đa 255 ký tự'),
  /** Đơn vị đồng, số nguyên không âm (gõ "25000", không có dấu chấm) */
  priceVnd: z
    .string()
    .trim()
    .regex(/^\d+$/, 'Giá phải là số nguyên không âm, vd 25000')
    .refine((value) => Number(value) <= 100_000_000, 'Giá tối đa 100.000.000đ'),
  imageUrl: z
    .string()
    .trim()
    .max(500, 'Tối đa 500 ký tự')
    .refine((value) => value === '' || z.url().safeParse(value).success, 'Link không hợp lệ'),
  isAvailable: z.boolean(),
  isBestSeller: z.boolean(),
  sortOrder,
  isActive: z.boolean(),
})

export type MenuItemFormInput = z.infer<typeof menuItemFormSchema>

/** Tên các ô, dùng cho applyServerErrors (gán `details` của COMMON_001 vào đúng ô) */
export const MENU_ITEM_FORM_FIELDS = menuItemFormSchema.keyof().options

export const menuCategoryFormSchema = z.object({
  name: z.string().trim().min(1, 'Không được để trống').max(50, 'Tối đa 50 ký tự'),
  sortOrder,
  isActive: z.boolean(),
})

export type MenuCategoryFormInput = z.infer<typeof menuCategoryFormSchema>

export const MENU_CATEGORY_FORM_FIELDS = menuCategoryFormSchema.keyof().options
