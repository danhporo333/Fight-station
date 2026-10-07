import { useQuery } from '@tanstack/react-query'

import { getShop } from '../services/shop.service'
import { shopKeys } from './shop.keys'

/** Thông tin quán (`GET /shop`). Footer, hero trang chủ và form quản trị dùng chung cache này. */
export function useShop() {
  return useQuery({
    queryKey: shopKeys.all,
    queryFn: async () => (await getShop()).data,
  })
}
