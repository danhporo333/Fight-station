import { http } from '@/shared/services/api'

import type { ChangePasswordInput, LoginInput } from '../types/auth.schema'
import type { CurrentAdmin, LoginResult } from '../types/auth.types'

export const login = (input: LoginInput) => http.post<LoginResult>('/auth/login', input)

export const getCurrentAdmin = () => http.get<CurrentAdmin>('/auth/me')

// confirmPassword chỉ dùng ở form, không gửi lên API
export const changePassword = ({ currentPassword, newPassword }: ChangePasswordInput) =>
  http.put<null>('/auth/password', { currentPassword, newPassword })
