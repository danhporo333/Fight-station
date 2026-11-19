import { http } from '@/shared/services/api'

import type {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  UpdateEmailInput,
} from '../types/auth.schema'
import type { CurrentAdmin, LoginResult, TokenResult } from '../types/auth.types'

export const login = (input: LoginInput) => http.post<LoginResult>('/auth/login', input)

export const getCurrentAdmin = () => http.get<CurrentAdmin>('/auth/me')

// confirmPassword chỉ dùng ở form, không gửi lên API
export const changePassword = ({ currentPassword, newPassword }: ChangePasswordInput) =>
  http.put<TokenResult>('/auth/password', { currentPassword, newPassword })

/** Luôn thành công dù tài khoản có tồn tại hay không (backend không lộ thông tin) */
export const forgotPassword = (input: ForgotPasswordInput) =>
  http.post<null>('/auth/forgot-password', input)

export const resetPassword = (input: { token: string; newPassword: string }) =>
  http.post<null>('/auth/reset-password', input)

export const updateEmail = (input: UpdateEmailInput) =>
  http.put<CurrentAdmin>('/auth/email', input)
