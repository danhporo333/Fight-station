/** Khớp response /games và /game-categories (backend/src/features/game/context.md) */

export type AccentColor = 'orange' | 'red' | 'amber' | 'gold'

export interface Game {
  id: number
  title: string
  players: string | null
  posterUrl: string | null
  accentColor: AccentColor
  description: string | null
  gameCategoryId: number
  category: { id: number; name: string }
  sortOrder: number
  isActive: boolean
  /** ISO 8601 UTC */
  createdAt: string
  updatedAt: string
}

/** GET /games/:id, POST, PUT */
export interface GameDetail extends Game {
  /** null = có ở mọi chi nhánh; mảng = chỉ những chi nhánh này */
  branchIds: number[] | null
}

export interface GameListQuery {
  page?: number
  limit?: number
  sort?: string
  q?: string
  categoryId?: number
  branchId?: number
  /** Chỉ có hiệu lực khi có token admin */
  includeInactive?: boolean
}

/** Body POST /games; PUT gửi một phần */
export interface GamePayload {
  title: string
  gameCategoryId: number
  players: string | null
  posterUrl: string | null
  accentColor: AccentColor
  description: string | null
  sortOrder: number
  isActive: boolean
  branchIds: number[] | null
}

export interface GameCategory {
  id: number
  name: string
  sortOrder: number
  isActive: boolean
  /** Số game thuộc thể loại (kể cả game ẩn); > 0 thì không xóa được */
  gameCount: number
  createdAt: string
  updatedAt: string
}

export interface GameCategoryQuery {
  limit?: number
  includeInactive?: boolean
}

export type GameCategoryPayload = Pick<GameCategory, 'name' | 'sortOrder' | 'isActive'>

/** Chi nhánh để chọn trong form game (lấy từ GET /branches, không import feature branch) */
export interface BranchOption {
  id: number
  name: string
  isActive: boolean
}
