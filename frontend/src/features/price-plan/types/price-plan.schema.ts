import { z } from 'zod'

// Khớp backend price-plan.dto.ts. Ô nhập luôn là chuỗi; đổi sang số và null khi gửi
// (utils/price-plan.utils.ts → toPricePlanPayload).

/** Số dòng quyền lợi tối đa của một gói */
export const MAX_PRICE_PLAN_FEATURES = 10

// Tách object ra để `.omit()` lấy tên ô được (schema đã `.refine()` thì Zod không cho omit)
const pricePlanFormObject = z.object({
  name: z.string().trim().min(1, 'Không được để trống').max(100, 'Tối đa 100 ký tự'),
  /** Đơn vị đồng, số nguyên không âm (gõ "15000", không có dấu chấm) */
  priceVnd: z
    .string()
    .trim()
    .regex(/^\d+$/, 'Giá phải là số nguyên không âm, vd 15000')
    .refine((value) => Number(value) <= 100_000_000, 'Giá tối đa 100.000.000đ'),
  unit: z.string().trim().min(1, 'Không được để trống').max(30, 'Tối đa 30 ký tự'),
  description: z.string().trim().max(255, 'Tối đa 255 ký tự'),
  isHot: z.boolean(),
  /** true = áp dụng mọi chi nhánh (gửi branchIds: null) */
  allBranches: z.boolean(),
  /** Id chi nhánh được tick (chuỗi, đúng giá trị của ô checkbox) */
  branchIds: z.array(z.string()),
  sortOrder: z
    .string()
    .trim()
    .regex(/^-?\d+$/, 'Phải là số nguyên'),
  isActive: z.boolean(),
  /** useFieldArray cần phần tử là object nên mỗi quyền lợi là `{ content }` */
  features: z
    .array(
      z.object({
        content: z.string().trim().min(1, 'Không được để trống').max(255, 'Tối đa 255 ký tự'),
      }),
    )
    .max(MAX_PRICE_PLAN_FEATURES, `Tối đa ${MAX_PRICE_PLAN_FEATURES} quyền lợi`),
})

/** Chọn từng chi nhánh thì phải tick ít nhất một (không tick nào sẽ lẫn với "mọi chi nhánh") */
export const pricePlanFormSchema = pricePlanFormObject.refine(
  (values) => values.allBranches || values.branchIds.length > 0,
  { path: ['branchIds'], message: 'Chọn ít nhất 1 chi nhánh, hoặc bật "Áp dụng mọi chi nhánh"' },
)

export type PricePlanFormInput = z.infer<typeof pricePlanFormSchema>

/** Tên các ô thường, dùng để gán `details` của COMMON_001 (ô quyền lợi xử lý riêng theo chỉ số) */
export const PRICE_PLAN_FORM_FIELDS = pricePlanFormObject.omit({ features: true }).keyof().options
