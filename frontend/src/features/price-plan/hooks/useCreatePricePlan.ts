import { useMutation } from '@tanstack/react-query'

import { createPricePlan } from '../services/price-plan.service'
import { useInvalidatePricePlans } from './useInvalidatePricePlans'

export function useCreatePricePlan() {
  const invalidate = useInvalidatePricePlans()
  return useMutation({ mutationFn: createPricePlan, onSuccess: invalidate })
}
