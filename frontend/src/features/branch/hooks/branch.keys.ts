import type { BranchListQuery } from '../types/branch.types'

// Query key của feature branch, gom một chỗ để invalidate đúng key
export const branchKeys = {
  lists: ['branches'] as const,
  list: (query: BranchListQuery) => [...branchKeys.lists, query] as const,
  details: ['branch'] as const,
  detail: (id: number, includeInactive: boolean) =>
    [...branchKeys.details, id, { includeInactive }] as const,
}
