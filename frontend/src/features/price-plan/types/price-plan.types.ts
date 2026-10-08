/** Khớp response /price-plans (backend/src/features/price-plan/context.md) */

/** Một dòng quyền lợi của gói; API đã xếp đúng thứ tự */
export interface PricePlanFeature {
  id: number
  content: string
  sortOrder: number
}

export interface PricePlan {
  id: number
  name: string
  /** Đơn vị đồng */
  priceVnd: number
  /** Đơn vị tính, vd "/giờ" */
  unit: string
  /** Dòng phụ dưới giá, vd "Giờ thường — Thứ 2 đến Thứ 6" */
  description: string | null
  /** Gói nổi bật: hiện nhãn HOT */
  isHot: boolean
  /** Chi nhánh áp dụng (theo thứ tự hiển thị); mảng rỗng = mọi chi nhánh */
  branches: { id: number; name: string }[]
  features: PricePlanFeature[]
  sortOrder: number
  isActive: boolean
  /** ISO 8601 UTC */
  createdAt: string
  updatedAt: string
}

export interface PricePlanQuery {
  page?: number
  limit?: number
  sort?: string
  /** Gói riêng của chi nhánh này cộng gói chung; trống = mọi gói */
  branchId?: number
  /** Chỉ có hiệu lực khi có token admin */
  includeInactive?: boolean
}

/** Body POST /price-plans; PUT gửi một phần. `features` là mảng chuỗi, thứ tự mảng = thứ tự hiển thị. */
export interface PricePlanPayload {
  name: string
  priceVnd: number
  unit: string
  description: string | null
  isHot: boolean
  /** null = áp dụng mọi chi nhánh; mảng = chỉ các chi nhánh đó (không được rỗng) */
  branchIds: number[] | null
  sortOrder: number
  isActive: boolean
  features: string[]
}

/** Chi nhánh để chọn trong form gói giá (kể cả chi nhánh đang ẩn) */
export interface BranchOption {
  id: number
  name: string
  isActive: boolean
}
