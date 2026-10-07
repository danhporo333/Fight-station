import { useQueryClient } from '@tanstack/react-query'

import { branchKeys } from './branch.keys'

/** Sau mọi thao tác ghi: làm mới danh sách và chi tiết (trang công khai và quản trị dùng chung cache) */
export function useInvalidateBranches() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: branchKeys.lists }),
      queryClient.invalidateQueries({ queryKey: branchKeys.details }),
    ])
}
