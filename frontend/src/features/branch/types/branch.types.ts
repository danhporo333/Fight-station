/** Chi nhánh, khớp response /branches (backend/src/features/branch/context.md) */
export interface Branch {
  id: number
  name: string
  address: string
  phone: string | null
  openHours: string | null
  ps5Count: number
  vipRoomCount: number
  /** Số phòng PC; 0 = chi nhánh không có phòng PC */
  pcRoomCount: number
  areaM2: number | null
  mapUrl: string | null
  facebookUrl: string | null
  zaloUrl: string | null
  sortOrder: number
  isActive: boolean
  /** ISO 8601 UTC */
  createdAt: string
  updatedAt: string
}

export interface BranchListQuery {
  page?: number
  limit?: number
  sort?: string
  q?: string
  /** Chỉ có hiệu lực khi có token admin */
  includeInactive?: boolean
}

/** Body POST /branches; PUT gửi một phần */
export type BranchPayload = Omit<Branch, 'id' | 'createdAt' | 'updatedAt'>
