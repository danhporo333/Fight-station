import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useAuthStore } from '@/shared/stores/auth.store'

import { login } from '../services/auth.service'

/** Đăng nhập: thành công thì xóa cache cũ và lưu phiên (token + admin) vào auth.store */
export function useLogin() {
  const queryClient = useQueryClient()
  const setSession = useAuthStore((state) => state.setSession)

  return useMutation({
    mutationFn: login,
    onSuccess: ({ data }) => {
      queryClient.clear()
      setSession(data.accessToken, data.admin)
    },
  })
}
