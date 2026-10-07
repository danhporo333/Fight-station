import { z } from 'zod';

import { paginationQuerySchema } from '@/shared/utils/pagination';
import { hasAnyField, requiredText } from '@/shared/utils/zod-fields';

const sortOrder = z.number().int('Phải là số nguyên');

export const createGameCategorySchema = z.object({
  name: requiredText(50),
  sortOrder: sortOrder.default(0),
  isActive: z.boolean().default(true),
});

// PUT cập nhật một phần: bỏ default để trường không gửi giữ nguyên
export const updateGameCategorySchema = z
  .object({ name: requiredText(50), sortOrder, isActive: z.boolean() })
  .partial()
  .refine(...hasAnyField);

export const gameCategoryIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const listGameCategoriesQuerySchema = paginationQuerySchema.extend({
  includeInactive: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
});

export type CreateGameCategoryDto = z.infer<typeof createGameCategorySchema>;
export type UpdateGameCategoryDto = z.infer<typeof updateGameCategorySchema>;
export type GameCategoryIdParams = z.infer<typeof gameCategoryIdParamsSchema>;
export type ListGameCategoriesQuery = z.infer<typeof listGameCategoriesQuerySchema>;
