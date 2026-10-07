import { z } from 'zod';

import { paginationQuerySchema } from '@/shared/utils/pagination';
import { hasAnyField, optionalText, optionalUrl, requiredText } from '@/shared/utils/zod-fields';

const sortOrder = z.number().int('Phải là số nguyên');

const itemFields = {
  menuCategoryId: z.number().int('Phải là số nguyên').positive(),
  name: requiredText(150),
  description: optionalText(255),
  /** Đơn vị đồng, số nguyên không âm (cột INT UNSIGNED) */
  priceVnd: z.number().int('Giá phải là số nguyên').min(0, 'Giá không được âm').max(100_000_000),
  imageUrl: optionalUrl,
};

export const createMenuItemSchema = z.object({
  ...itemFields,
  isAvailable: z.boolean().default(true),
  isBestSeller: z.boolean().default(false),
  sortOrder: sortOrder.default(0),
  isActive: z.boolean().default(true),
});

// PUT cập nhật một phần: bỏ default để trường không gửi giữ nguyên (đổi `isAvailable` = "tạm hết")
export const updateMenuItemSchema = z
  .object({
    ...itemFields,
    isAvailable: z.boolean(),
    isBestSeller: z.boolean(),
    sortOrder,
    isActive: z.boolean(),
  })
  .partial()
  .refine(...hasAnyField);

export const menuItemIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

/** Boolean trên query: không dùng z.coerce.boolean() vì "false" thành true */
const booleanQuery = z
  .enum(['true', 'false'])
  .transform((value) => value === 'true')
  .optional();

export const listMenuItemsQuerySchema = paginationQuerySchema.extend({
  q: z.string().trim().min(1).max(150).optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  isAvailable: booleanQuery,
  includeInactive: booleanQuery,
});

export const getMenuItemQuerySchema = z.object({ includeInactive: booleanQuery });

export type CreateMenuItemDto = z.infer<typeof createMenuItemSchema>;
export type UpdateMenuItemDto = z.infer<typeof updateMenuItemSchema>;
export type MenuItemIdParams = z.infer<typeof menuItemIdParamsSchema>;
export type ListMenuItemsQuery = z.infer<typeof listMenuItemsQuerySchema>;
export type GetMenuItemQuery = z.infer<typeof getMenuItemQuerySchema>;
