/** Khớp response /menu, /menu-items, /menu-categories (backend/src/features/menu/context.md) */

/** Món trong GET /menu (đã nằm trong nhóm nên không kèm nhóm) */
export interface MenuEntry {
  id: number
  name: string
  description: string | null
  /** Đơn vị đồng */
  priceVnd: number
  imageUrl: string | null
  /** false = tạm hết (vẫn hiện, mờ đi) */
  isAvailable: boolean
  /** Món bán chạy: huy hiệu "Best seller" */
  isBestSeller: boolean
  sortOrder: number
}

/** Một nhóm trong GET /menu, kèm các món đang hiện */
export interface MenuSection {
  id: number
  name: string
  sortOrder: number
  items: MenuEntry[]
}

/** Món ở GET /menu-items, GET /menu-items/:id, POST, PUT */
export interface MenuItem extends MenuEntry {
  category: { id: number; name: string }
  isActive: boolean
  /** ISO 8601 UTC */
  createdAt: string
  updatedAt: string
}

export interface MenuItemQuery {
  page?: number
  limit?: number
  sort?: string
  q?: string
  categoryId?: number
  isAvailable?: boolean
  /** Chỉ có hiệu lực khi có token admin */
  includeInactive?: boolean
}

/** Body POST /menu-items; PUT gửi một phần */
export interface MenuItemPayload {
  menuCategoryId: number
  name: string
  description: string | null
  priceVnd: number
  imageUrl: string | null
  isAvailable: boolean
  isBestSeller: boolean
  sortOrder: number
  isActive: boolean
}

export interface MenuCategory {
  id: number
  name: string
  sortOrder: number
  isActive: boolean
  /** Số món trong nhóm (kể cả món ẩn); > 0 thì không xóa được */
  itemCount: number
  createdAt: string
  updatedAt: string
}

export interface MenuCategoryQuery {
  limit?: number
  includeInactive?: boolean
}

export type MenuCategoryPayload = Pick<MenuCategory, 'name' | 'sortOrder' | 'isActive'>
