import { useQuery } from '@tanstack/react-query'

import { getBranches } from '../services/branch.service'
import type { BranchListQuery } from '../types/branch.types'
import { branchKeys } from './branch.keys'

// Quán chỉ có vài chi nhánh: lấy hết một lần, không phân trang phía client
const DEFAULT_QUERY: BranchListQuery = { limit: 100 }

/** Danh sách chi nhánh. Trang quản trị truyền `{ includeInactive: true }` để thấy cả chi nhánh đang ẩn. */
export function useBranches(query: BranchListQuery = {}) {
  const params = { ...DEFAULT_QUERY, ...query }
  return useQuery({
    queryKey: branchKeys.list(params),
    queryFn: async () => (await getBranches(params)).data,
  })
}
