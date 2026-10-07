import { z } from 'zod'

// Khớp backend/src/features/branch/branch.dto.ts. Ô nhập trong form luôn là chuỗi; ô số được kiểm tra
// bằng regex rồi đổi sang number khi gửi (utils/branch.utils.ts → toBranchPayload). Ô trống → null.
const MAX_SMALLINT = 65_535

const optionalText = (max: number) => z.string().trim().max(max, `Tối đa ${max} ký tự`)

const optionalUrl = optionalText(500).refine(
  (value) => value === '' || z.url().safeParse(value).success,
  'Link không hợp lệ',
)

const intText = (min: number, { required }: { required: boolean }) =>
  z
    .string()
    .trim()
    .refine((value) => !required || value !== '', 'Không được để trống')
    .refine((value) => value === '' || /^\d+$/.test(value), 'Phải là số nguyên')
    .refine(
      (value) => value === '' || (Number(value) >= min && Number(value) <= MAX_SMALLINT),
      `Từ ${min} đến ${MAX_SMALLINT}`,
    )

export const branchFormSchema = z.object({
  name: z.string().trim().min(1, 'Không được để trống').max(100, 'Tối đa 100 ký tự'),
  address: z.string().trim().min(1, 'Không được để trống').max(255, 'Tối đa 255 ký tự'),
  phone: optionalText(20),
  openHours: optionalText(100),
  ps5Count: intText(0, { required: true }),
  vipRoomCount: intText(0, { required: true }),
  pcRoomCount: intText(0, { required: true }),
  areaM2: intText(1, { required: false }),
  mapUrl: optionalUrl,
  facebookUrl: optionalUrl,
  zaloUrl: optionalUrl,
  sortOrder: z
    .string()
    .trim()
    .regex(/^-?\d+$/, 'Phải là số nguyên'),
  isActive: z.boolean(),
})

export type BranchFormInput = z.infer<typeof branchFormSchema>

/** Tên các ô, dùng cho applyServerErrors (gán `details` của COMMON_001 vào đúng ô) */
export const BRANCH_FORM_FIELDS = branchFormSchema.keyof().options
