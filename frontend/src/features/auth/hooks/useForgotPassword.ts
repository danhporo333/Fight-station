import { useMutation } from '@tanstack/react-query'

import { forgotPassword } from '../services/auth.service'

/** Yêu cầu gửi link đặt lại mật khẩu qua email */
export function useForgotPassword() {
  return useMutation({ mutationFn: forgotPassword })
}
