import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { getGames } from '../services/game.service'
import type { GameListQuery } from '../types/game.types'
import { gameKeys } from './game.keys'

// Mặc định lấy tối đa 100 game một lần (trang quản trị); trang /games truyền `page` + `limit: 8`
const DEFAULT_QUERY: GameListQuery = { limit: 100 }

/**
 * Danh sách game: `data` = `{ items, meta }` (meta có `page`, `totalPages`... để phân trang).
 * Trang quản trị truyền `{ includeInactive: true }` để thấy cả game đang ẩn.
 */
export function useGames(query: GameListQuery = {}) {
  const params = { ...DEFAULT_QUERY, ...query }
  return useQuery({
    queryKey: gameKeys.list(params),
    queryFn: async () => {
      const { data, meta } = await getGames(params)
      return { items: data, meta }
    },
    // Đổi trang / bộ lọc / từ khóa: giữ kết quả cũ trên màn hình trong lúc tải, không nháy về khung xám
    placeholderData: keepPreviousData,
  })
}
