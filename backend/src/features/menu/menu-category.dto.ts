import { z } from 'zod';

import { paginationQuerySchema } from '@/shared/utils/pagination';
import { hasAnyField, requiredText } from '@/shared/utils/zod-fields';

const sortOrder = z.number().int('Phải là số nguyên');

export const createMenuCategorySchema = z.object({
  name: requiredText(50),
  sortOrder: sortOrder.default(0),
  isActive: z.boolean().default(true),
});

// PUT cập nhật một phần: bỏ default để trường không gửi giữ nguyên
export const updateMenuCategorySchema = z
  .object({ name: requiredText(50), sortOrder, isActive: z.boolean() })
  .partial()
  .refine(...hasAnyField);

export const menuCategoryIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const listMenuCategoriesQuerySchema = paginationQuerySchema.extend({
  includeInactive: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
});

export type CreateMenuCategoryDto = z.infer<typeof createMenuCategorySchema>;
export type UpdateMenuCategoryDto = z.infer<typeof updateMenuCategorySchema>;
export type MenuCategoryIdParams = z.infer<typeof menuCategoryIdParamsSchema>;
export type ListMenuCategoriesQuery = z.infer<typeof listMenuCategoriesQuerySchema>;
