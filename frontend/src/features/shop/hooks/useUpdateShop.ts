import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateShop } from '../services/shop.service'
import { shopKeys } from './shop.keys'

/** Sửa thông tin quán (Owner). Xong thì làm mới cache để footer và hero hiện dữ liệu mới. */
export function useUpdateShop() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateShop,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: shopKeys.all }),
  })
}
