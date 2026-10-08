import { useQueryClient } from '@tanstack/react-query'

import { pricePlanKeys } from './price-plan.keys'

/** Sau mọi thao tác ghi: làm mới danh sách (trang khách, trang quản trị) và chi tiết gói */
export function useInvalidatePricePlans() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: pricePlanKeys.list }),
      queryClient.invalidateQueries({ queryKey: pricePlanKeys.details }),
    ])
}
