import { useQuery } from '@tanstack/react-query'

import { getMenu } from '../services/menu.service'
import { menuKeys } from './menu.keys'

/** Toàn bộ menu cho trang khách: nhóm đang hiện, mỗi nhóm kèm các món đang hiện */
export function useMenu() {
  return useQuery({
    queryKey: menuKeys.board,
    queryFn: async () => (await getMenu()).data,
  })
}
