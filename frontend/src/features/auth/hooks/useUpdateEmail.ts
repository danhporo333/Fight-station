import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateEmail } from '../services/auth.service'
import { authKeys } from './auth.keys'

/** Đặt/xoá email khôi phục mật khẩu; làm mới thông tin tài khoản */
export function useUpdateEmail() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateEmail,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: authKeys.me() }),
  })
}
