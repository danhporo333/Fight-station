import { useQuery } from '@tanstack/react-query'

import { getBranchOptions } from '../services/price-plan.service'
import { pricePlanKeys } from './price-plan.keys'

/** Chi nhánh để chọn "Áp dụng cho" trong form gói giá */
export function useBranchOptions() {
  return useQuery({
    queryKey: pricePlanKeys.branchOptions,
    queryFn: async () => (await getBranchOptions()).data,
  })
}
