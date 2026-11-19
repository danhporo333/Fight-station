import { useMutation } from '@tanstack/react-query'

import { resetPassword } from '../services/auth.service'

/** Đặt mật khẩu mới bằng token trong link email */
export function useResetPassword() {
  return useMutation({ mutationFn: resetPassword })
}
