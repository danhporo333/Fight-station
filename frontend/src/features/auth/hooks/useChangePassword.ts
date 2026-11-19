import { useMutation } from '@tanstack/react-query'

import { useAuthStore } from '@/shared/stores/auth.store'

import { changePassword } from '../services/auth.service'

/** Đổi mật khẩu của chính mình. Token cũ hết hiệu lực nên lưu ngay token mới để không bị đăng xuất */
export function useChangePassword() {
  const setAccessToken = useAuthStore((state) => state.setAccessToken)

  return useMutation({
    mutationFn: changePassword,
    onSuccess: ({ data }) => setAccessToken(data.accessToken),
  })
}
