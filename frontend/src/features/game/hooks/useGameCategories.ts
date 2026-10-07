import { useQuery } from '@tanstack/react-query'

import { getGameCategories } from '../services/game-category.service'
import type { GameCategoryQuery } from '../types/game.types'
import { gameKeys } from './game.keys'

/** Thể loại (bộ lọc trang khách, ô chọn trong form, trang quản trị với `includeInactive`) */
export function useGameCategories(query: GameCategoryQuery = {}) {
  const params = { limit: 100, ...query }
  return useQuery({
    queryKey: gameKeys.categoryList(params),
    queryFn: async () => (await getGameCategories(params)).data,
  })
}
