import { z } from 'zod'

// Khớp backend/src/features/auth/auth.dto.ts (độ dài, thông báo). Mật khẩu không trim.
const MAX_PASSWORD_LENGTH = 200

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Nhập tên đăng nhập').max(50),
  password: z.string().min(1, 'Nhập mật khẩu').max(MAX_PASSWORD_LENGTH),
})

export type LoginInput = z.infer<typeof loginSchema>

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Nhập mật khẩu hiện tại').max(MAX_PASSWORD_LENGTH),
    newPassword: z.string().min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự').max(MAX_PASSWORD_LENGTH),
    // Chỉ kiểm tra ở giao diện, không gửi lên API
    confirmPassword: z.string().min(1, 'Nhập lại mật khẩu mới'),
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    path: ['newPassword'],
    message: 'Mật khẩu mới phải khác mật khẩu hiện tại',
  })
  .refine((data) => data.confirmPassword === data.newPassword, {
    path: ['confirmPassword'],
    message: 'Mật khẩu nhập lại không khớp',
  })

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
