import { z } from 'zod';

import { paginationQuerySchema } from '@/shared/utils/pagination';
import { hasAnyField, optionalText, optionalUrl, requiredText } from '@/shared/utils/zod-fields';

const id = z.number().int('Phải là số nguyên').positive();
const sortOrder = z.number().int('Phải là số nguyên');
const accentColor = z.enum(['orange', 'red', 'amber', 'gold'], 'Màu không hợp lệ');

/**
 * `branchIds`: không gửi hoặc `null` = có ở MỌI chi nhánh (không ghi dòng nào vào branch_game);
 * mảng = chỉ những chi nhánh đó. Mảng rỗng bị từ chối vì sẽ lẫn với "mọi chi nhánh".
 */
const branchIds = z
  .array(id)
  .min(1, 'Chọn ít nhất 1 chi nhánh, hoặc gửi null để có ở mọi chi nhánh')
  .max(100)
  .nullable();

const gameFields = {
  title: requiredText(150),
  gameCategoryId: id,
  players: optionalText(20),
  posterUrl: optionalUrl,
  description: optionalText(2000),
};

export const createGameSchema = z.object({
  ...gameFields,
  accentColor: accentColor.default('orange'),
  sortOrder: sortOrder.default(0),
  isActive: z.boolean().default(true),
  branchIds: branchIds.optional(),
});

// PUT cập nhật một phần: bỏ default để trường không gửi giữ nguyên.
// `branchIds` không gửi = giữ nguyên; null = chuyển về mọi chi nhánh; mảng = thay toàn bộ.
export const updateGameSchema = z
  .object({ ...gameFields, accentColor, sortOrder, isActive: z.boolean(), branchIds })
  .partial()
  .refine(...hasAnyField);

export const gameIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const includeInactive = z
  .enum(['true', 'false'])
  .transform((value) => value === 'true')
  .optional();

export const listGamesQuerySchema = paginationQuerySchema.extend({
  q: z.string().trim().min(1).max(150).optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  branchId: z.coerce.number().int().positive().optional(),
  includeInactive,
});

export const getGameQuerySchema = z.object({ includeInactive });

export type CreateGameDto = z.infer<typeof createGameSchema>;
export type UpdateGameDto = z.infer<typeof updateGameSchema>;
export type GameIdParams = z.infer<typeof gameIdParamsSchema>;
export type ListGamesQuery = z.infer<typeof listGamesQuerySchema>;
export type GetGameQuery = z.infer<typeof getGameQuerySchema>;
