import { z } from 'zod';

// Trường tùy chọn: trim, chuỗi rỗng → null (business rule: không lưu chuỗi rỗng), gửi null để xóa giá trị
function optionalText(max: number) {
  return z
    .string()
    .trim()
    .max(max)
    .nullable()
    .optional()
    .transform((value) => (value === '' ? null : value));
}

function optionalFormat<T extends z.ZodType<string>>(schema: T) {
  return z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
    schema.nullable().optional(),
  );
}

const optionalUrl = optionalFormat(z.url('Link không hợp lệ').trim().max(500));

export const updateShopSchema = z
  .object({
    name: z.string().trim().min(1, 'Không được để trống').max(100),
    tagline: optionalText(500),
    hoursLabel: optionalText(50),
    hotline: optionalText(20),
    email: optionalFormat(z.email('Email không hợp lệ').trim().max(255)),
    facebookUrl: optionalUrl,
    zaloUrl: optionalUrl,
    tiktokUrl: optionalUrl,
    instagramUrl: optionalUrl,
    youtubeUrl: optionalUrl,
  })
  .partial()
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'Cần gửi ít nhất một trường',
  });

export type UpdateShopDto = z.infer<typeof updateShopSchema>;
