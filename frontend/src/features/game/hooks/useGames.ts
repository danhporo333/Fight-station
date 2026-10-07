import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { getGames } from '../services/game.service'
import type { GameListQuery } from '../types/game.types'
import { gameKeys } from './game.keys'

// Danh sách công khai lấy một lần tối đa 100 game, không phân trang phía client
const DEFAULT_QUERY: GameListQuery = { limit: 100 }

/** Danh sách game. Trang quản trị truyền `{ includeInactive: true }` để thấy cả game đang ẩn. */
export function useGames(query: GameListQuery = {}) {
  const params = { ...DEFAULT_QUERY, ...query }
  return useQuery({
    queryKey: gameKeys.list(params),
    queryFn: async () => (await getGames(params)).data,
    // Đổi bộ lọc / từ khóa: giữ kết quả cũ trên màn hình trong lúc tải, không nháy về khung xám
    placeholderData: keepPreviousData,
  })
}
