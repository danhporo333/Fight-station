import { z } from 'zod';

import { paginationQuerySchema } from '@/shared/utils/pagination';
import { hasAnyField, optionalText, requiredText } from '@/shared/utils/zod-fields';

const sortOrder = z.number().int('Phải là số nguyên');

/**
 * Quyền lợi của gói, mỗi phần tử một dòng; thứ tự trong mảng là thứ tự hiển thị (sortOrder).
 * `[]` hợp lệ (gói không có quyền lợi nào).
 */
const features = z.array(requiredText(255)).max(10, 'Tối đa 10 quyền lợi');

/**
 * `branchIds`: không gửi hoặc `null` = áp dụng MỌI chi nhánh (không ghi dòng nào vào price_plan_branch);
 * mảng = chỉ những chi nhánh đó. Mảng rỗng bị từ chối vì sẽ lẫn với "mọi chi nhánh".
 */
const branchIds = z
  .array(z.number().int().positive())
  .min(1, 'Chọn ít nhất 1 chi nhánh, hoặc gửi null để áp dụng mọi chi nhánh')
  .max(100)
  .nullable();

const planFields = {
  name: requiredText(100),
  /** Đơn vị đồng, số nguyên không âm (cột INT UNSIGNED) */
  priceVnd: z.number().int('Giá phải là số nguyên').min(0, 'Giá không được âm').max(100_000_000),
  /** Dòng phụ dưới giá, vd "Giờ thường — Thứ 2 đến Thứ 6" */
  description: optionalText(255),
};

export const createPricePlanSchema = z.object({
  ...planFields,
  unit: requiredText(30).default('/giờ'),
  isHot: z.boolean().default(false),
  branchIds: branchIds.default(null),
  sortOrder: sortOrder.default(0),
  isActive: z.boolean().default(true),
  features: features.default([]),
});

// PUT cập nhật một phần: bỏ default để trường không gửi giữ nguyên.
// `features` không gửi = giữ nguyên; mảng (kể cả []) = thay toàn bộ.
export const updatePricePlanSchema = z
  .object({
    ...planFields,
    unit: requiredText(30),
    isHot: z.boolean(),
    branchIds,
    sortOrder,
    isActive: z.boolean(),
    features,
  })
  .partial()
  .refine(...hasAnyField);

export const pricePlanIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const includeInactive = z
  .enum(['true', 'false'])
  .transform((value) => value === 'true')
  .optional();

export const listPricePlansQuerySchema = paginationQuerySchema.extend({
  /** Chỉ lấy gói áp dụng ở chi nhánh này (gồm cả gói chung) */
  branchId: z.coerce.number().int().positive().optional(),
  includeInactive,
});

export const getPricePlanQuerySchema = z.object({ includeInactive });

export type CreatePricePlanDto = z.infer<typeof createPricePlanSchema>;
export type UpdatePricePlanDto = z.infer<typeof updatePricePlanSchema>;
export type PricePlanIdParams = z.infer<typeof pricePlanIdParamsSchema>;
export type ListPricePlansQuery = z.infer<typeof listPricePlansQuerySchema>;
export type GetPricePlanQuery = z.infer<typeof getPricePlanQuerySchema>;
