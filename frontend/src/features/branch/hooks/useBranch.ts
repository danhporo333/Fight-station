import { useQuery } from '@tanstack/react-query'

import { getBranch } from '../services/branch.service'
import { branchKeys } from './branch.keys'

/** Một chi nhánh. Form sửa (quản trị) dùng `includeInactive` để mở được cả chi nhánh đang ẩn. */
export function useBranch(id: number, includeInactive = false) {
  return useQuery({
    queryKey: branchKeys.detail(id, includeInactive),
    queryFn: async () => (await getBranch(id, includeInactive)).data,
    enabled: id > 0,
  })
}
