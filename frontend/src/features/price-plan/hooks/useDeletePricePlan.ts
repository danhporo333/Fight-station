import { useMutation } from '@tanstack/react-query'

import { deletePricePlan } from '../services/price-plan.service'
import { useInvalidatePricePlans } from './useInvalidatePricePlans'

export function useDeletePricePlan() {
  const invalidate = useInvalidatePricePlans()
  return useMutation({ mutationFn: deletePricePlan, onSuccess: invalidate })
}
