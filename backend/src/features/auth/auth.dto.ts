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

export type LoginDto = z.infer<typeof loginSchema>;
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
