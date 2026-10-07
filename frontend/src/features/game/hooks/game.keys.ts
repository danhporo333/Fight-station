import { BRANCH_OPTIONS_PARAMS } from '../services/game.service'
import type { GameCategoryQuery, GameListQuery } from '../types/game.types'

// Query key của feature game, gom một chỗ để invalidate đúng key
export const gameKeys = {
  lists: ['games'] as const,
  list: (query: GameListQuery) => [...gameKeys.lists, query] as const,
  details: ['game'] as const,
  detail: (id: number, includeInactive: boolean) =>
    [...gameKeys.details, id, { includeInactive }] as const,
  categories: ['game-categories'] as const,
  categoryList: (query: GameCategoryQuery) => [...gameKeys.categories, query] as const,
  /**
   * Cùng key với danh sách chi nhánh của trang quản trị chi nhánh (['branches', params]): dùng chung
   * cache, và thêm/sửa/xóa chi nhánh (invalidate ['branches']) cũng làm mới danh sách này.
   */
  branchOptions: ['branches', BRANCH_OPTIONS_PARAMS] as const,
}
