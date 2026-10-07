import { http } from '@/shared/services/api'

import type { Branch, BranchListQuery, BranchPayload } from '../types/branch.types'

export const getBranches = (params: BranchListQuery) => http.get<Branch[]>('/branches', { params })

export const getBranch = (id: number, includeInactive = false) =>
  http.get<Branch>(`/branches/${id}`, { params: includeInactive ? { includeInactive } : undefined })

export const createBranch = (payload: BranchPayload) => http.post<Branch>('/branches', payload)

export const updateBranch = (id: number, payload: Partial<BranchPayload>) =>
  http.put<Branch>(`/branches/${id}`, payload)

export const deleteBranch = (id: number) => http.delete(`/branches/${id}`)
