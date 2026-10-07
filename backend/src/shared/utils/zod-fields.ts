import { z } from 'zod';

// Trường chuỗi dùng chung trong *.dto.ts. Quy ước API_SPEC.md mục 3: server trim chuỗi, trường tùy chọn
// gửi null để xóa giá trị; dự án không lưu chuỗi rỗng nên '' (hoặc toàn khoảng trắng) cũng thành null.

/** Chuỗi bắt buộc: trim, không rỗng, tối đa `max` ký tự */
export function requiredText(max: number) {
  return z.string().trim().min(1, 'Không được để trống').max(max);
}

/** Chuỗi tùy chọn: trim, tối đa `max` ký tự; '' → null */
export function optionalText(max: number) {
  return z
    .string()
    .trim()
    .max(max)
    .nullable()
    .optional()
    .transform((value) => (value === '' ? null : value));
}

/** Bọc schema có định dạng (url, email): '' → null trước khi kiểm tra định dạng */
function optionalFormat<T extends z.ZodType<string>>(schema: T) {
  return z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
    schema.nullable().optional(),
  );
}

/** Link đầy đủ (https://...), tối đa 500 ký tự (cột VARCHAR(500)); '' → null */
export const optionalUrl = optionalFormat(z.url('Link không hợp lệ').trim().max(500));

/** Email, tối đa 255 ký tự; '' → null */
export const optionalEmail = optionalFormat(z.email('Email không hợp lệ').trim().max(255));

/** Dùng với `.refine()` cho body PUT: phải có ít nhất một trường */
export const hasAnyField = [
  (data: Record<string, unknown>) => Object.values(data).some((value) => value !== undefined),
  { message: 'Cần gửi ít nhất một trường' },
] as const;
