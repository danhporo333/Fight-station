import { useQuery } from '@tanstack/react-query'

import { getPricePlan } from '../services/price-plan.service'
import { pricePlanKeys } from './price-plan.keys'

/** Một gói. Form sửa dùng `includeInactive` để mở được cả gói đang ẩn. */
export function usePricePlan(id: number, includeInactive = false) {
  return useQuery({
    queryKey: pricePlanKeys.detail(id, includeInactive),
    queryFn: async () => (await getPricePlan(id, includeInactive)).data,
    enabled: id > 0,
  })
}
