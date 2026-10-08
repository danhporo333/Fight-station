import { useMutation } from '@tanstack/react-query'

import { updatePricePlan } from '../services/price-plan.service'
import type { PricePlanPayload } from '../types/price-plan.types'
import { useInvalidatePricePlans } from './useInvalidatePricePlans'

/** PUT cập nhật một phần; nút ẩn/hiện nhanh chỉ gửi `{ isActive }` (không gửi `features` thì giữ nguyên) */
export function useUpdatePricePlan() {
  const invalidate = useInvalidatePricePlans()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<PricePlanPayload> }) =>
      updatePricePlan(id, payload),
    onSuccess: invalidate,
  })
}
