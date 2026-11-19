import { z } from 'zod';

// Mật khẩu không trim (khoảng trắng là một phần của mật khẩu). Giới hạn 200 ký tự để argon2 không bị lạm dụng.
const MAX_PASSWORD_LENGTH = 200;

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Nhập tên đăng nhập').max(50),
  password: z.string().min(1, 'Nhập mật khẩu').max(MAX_PASSWORD_LENGTH),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Nhập mật khẩu hiện tại').max(MAX_PASSWORD_LENGTH),
    newPassword: z.string().min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự').max(MAX_PASSWORD_LENGTH),
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    path: ['newPassword'],
    message: 'Mật khẩu mới phải khác mật khẩu hiện tại',
  });

const newPasswordSchema = z
  .string()
  .min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự')
  .max(MAX_PASSWORD_LENGTH);

/** `identifier` là tên đăng nhập hoặc email khôi phục */
export const forgotPasswordSchema = z.object({
  identifier: z.string().trim().min(1, 'Nhập tên đăng nhập hoặc email').max(255),
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(1, 'Thiếu mã đặt lại mật khẩu').max(200),
  newPassword: newPasswordSchema,
});

/** Email rỗng = xoá email khôi phục. Phải nhập mật khẩu hiện tại để đổi. */
export const updateEmailSchema = z.object({
  currentPassword: z.string().min(1, 'Nhập mật khẩu hiện tại').max(MAX_PASSWORD_LENGTH),
  email: z
    .string()
    .trim()
    .max(255)
    .transform((value) => value.toLowerCase())
    .pipe(z.union([z.literal(''), z.email('Email không hợp lệ')]))
    .transform((value) => (value === '' ? null : value)),
});

export type LoginDto = z.infer<typeof loginSchema>;
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
export type UpdateEmailDto = z.infer<typeof updateEmailSchema>;
