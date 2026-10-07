import { z } from 'zod'

// Khớp backend game.dto.ts / game-category.dto.ts. Ô nhập luôn là chuỗi; đổi sang số và null khi gửi
// (utils/game.utils.ts → toGamePayload, toGameCategoryPayload).

const optionalText = (max: number) => z.string().trim().max(max, `Tối đa ${max} ký tự`)

const sortOrder = z
  .string()
  .trim()
  .regex(/^-?\d+$/, 'Phải là số nguyên')

export const gameFormSchema = z
  .object({
    title: z.string().trim().min(1, 'Không được để trống').max(150, 'Tối đa 150 ký tự'),
    gameCategoryId: z.string().min(1, 'Chọn thể loại'),
    players: optionalText(20),
    posterUrl: optionalText(500).refine(
      (value) => value === '' || z.url().safeParse(value).success,
      'Link không hợp lệ',
    ),
    accentColor: z.enum(['orange', 'red', 'amber', 'gold']),
    description: optionalText(2000),
    sortOrder,
    isActive: z.boolean(),
    /** true = có ở mọi chi nhánh (gửi branchIds: null) */
    allBranches: z.boolean(),
    /** Giá trị checkbox là chuỗi id */
    branchIds: z.array(z.string()),
  })
  .refine((values) => values.allBranches || values.branchIds.length > 0, {
    path: ['branchIds'],
    message: 'Chọn ít nhất 1 chi nhánh, hoặc chọn "Có ở mọi chi nhánh"',
  })

export type GameFormInput = z.infer<typeof gameFormSchema>

/** Tên các ô, dùng cho applyServerErrors (gán `details` của COMMON_001 vào đúng ô) */
export const GAME_FORM_FIELDS = [
  'title',
  'gameCategoryId',
  'players',
  'posterUrl',
  'accentColor',
  'description',
  'sortOrder',
  'isActive',
  'branchIds',
] as const satisfies readonly (keyof GameFormInput)[]

export const gameCategoryFormSchema = z.object({
  name: z.string().trim().min(1, 'Không được để trống').max(50, 'Tối đa 50 ký tự'),
  sortOrder,
  isActive: z.boolean(),
})

export type GameCategoryFormInput = z.infer<typeof gameCategoryFormSchema>

export const GAME_CATEGORY_FORM_FIELDS = gameCategoryFormSchema.keyof().options
