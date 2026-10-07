import { useQuery } from '@tanstack/react-query'

import { useAuthStore } from '@/shared/stores/auth.store'

import { getCurrentAdmin } from '../services/auth.service'
import { authKeys } from './auth.keys'

/**
 * Tài khoản đang đăng nhập (`GET /auth/me`). Chỉ gọi khi có token. Token hết hạn hoặc tài khoản bị
 * khóa thì API trả lỗi và http.ts phát `auth:expired` → providers.tsx đưa về trang đăng nhập.
 */
export function useCurrentAdmin() {
  const hasToken = useAuthStore((state) => state.accessToken !== null)

  return useQuery({
    queryKey: authKeys.me(),
    queryFn: getCurrentAdmin,
    enabled: hasToken,
  })
}
