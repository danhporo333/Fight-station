import { useMutation } from '@tanstack/react-query'

import { createBranch } from '../services/branch.service'
import { useInvalidateBranches } from './useInvalidateBranches'

export function useCreateBranch() {
  const invalidate = useInvalidateBranches()
  return useMutation({ mutationFn: createBranch, onSuccess: invalidate })
}
