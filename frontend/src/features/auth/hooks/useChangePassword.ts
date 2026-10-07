import { useMutation } from '@tanstack/react-query'

import { changePassword } from '../services/auth.service'

/** Đổi mật khẩu của chính mình; token hiện tại vẫn dùng được tới khi hết hạn */
export function useChangePassword() {
  return useMutation({ mutationFn: changePassword })
}
