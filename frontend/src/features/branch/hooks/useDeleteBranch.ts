import { useMutation } from '@tanstack/react-query'

import { deleteBranch } from '../services/branch.service'
import { useInvalidateBranches } from './useInvalidateBranches'

/** Xóa thật; game ở chi nhánh này tự được gỡ (backend ON DELETE CASCADE) */
export function useDeleteBranch() {
  const invalidate = useInvalidateBranches()
  return useMutation({ mutationFn: deleteBranch, onSuccess: invalidate })
}
