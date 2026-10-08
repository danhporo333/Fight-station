import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { getPricePlans } from '../services/price-plan.service'
import type { PricePlanQuery } from '../types/price-plan.types'
import { pricePlanKeys } from './price-plan.keys'

/** Danh sách gói (trang quản trị truyền `includeInactive: true`); mặc định tối đa 100 gói */
export function usePricePlans(query: PricePlanQuery = {}) {
  const params = { limit: 100, ...query }
  return useQuery({
    queryKey: pricePlanKeys.listWith(params),
    queryFn: async () => (await getPricePlans(params)).data,
    placeholderData: keepPreviousData,
  })
}
