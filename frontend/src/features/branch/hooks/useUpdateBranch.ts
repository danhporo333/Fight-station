import { useMutation } from '@tanstack/react-query'

import { updateBranch } from '../services/branch.service'
import type { BranchPayload } from '../types/branch.types'
import { useInvalidateBranches } from './useInvalidateBranches'

/** PUT cập nhật một phần: chỉ gửi trường cần đổi */
export function useUpdateBranch() {
  const invalidate = useInvalidateBranches()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<BranchPayload> }) =>
      updateBranch(id, payload),
    onSuccess: invalidate,
  })
}
