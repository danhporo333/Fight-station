import { z } from 'zod';

import { paginationQuerySchema } from '@/shared/utils/pagination';
import { hasAnyField, optionalText, optionalUrl, requiredText } from '@/shared/utils/zod-fields';

// SMALLINT UNSIGNED: 0–65535
const MAX_SMALLINT = 65_535;
const count = z.number().int('Phải là số nguyên').min(0).max(MAX_SMALLINT);

export const createBranchSchema = z.object({
  name: requiredText(100),
  address: requiredText(255),
  phone: optionalText(20),
  openHours: optionalText(100),
  ps5Count: count.default(0),
  vipRoomCount: count.default(0),
  pcRoomCount: count.default(0),
  areaM2: z.number().int('Phải là số nguyên').min(1).max(MAX_SMALLINT).nullable().optional(),
  mapUrl: optionalUrl,
  facebookUrl: optionalUrl,
  zaloUrl: optionalUrl,
  sortOrder: z.number().int('Phải là số nguyên').default(0),
  isActive: z.boolean().default(true),
});

// PUT cập nhật một phần: bỏ default để trường không gửi giữ nguyên
export const updateBranchSchema = z
  .object({
    ...createBranchSchema.shape,
    ps5Count: count,
    vipRoomCount: count,
    pcRoomCount: count,
    sortOrder: z.number().int('Phải là số nguyên'),
    isActive: z.boolean(),
  })
  .partial()
  .refine(...hasAnyField);

export const branchIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const booleanQuery = z.enum(['true', 'false']).transform((value) => value === 'true');

export const listBranchesQuerySchema = paginationQuerySchema.extend({
  q: z.string().trim().min(1).max(100).optional(),
  includeInactive: booleanQuery.optional(),
});

export const getBranchQuerySchema = z.object({
  includeInactive: booleanQuery.optional(),
});

export type CreateBranchDto = z.infer<typeof createBranchSchema>;
export type UpdateBranchDto = z.infer<typeof updateBranchSchema>;
export type BranchIdParams = z.infer<typeof branchIdParamsSchema>;
export type ListBranchesQuery = z.infer<typeof listBranchesQuerySchema>;
export type GetBranchQuery = z.infer<typeof getBranchQuerySchema>;
