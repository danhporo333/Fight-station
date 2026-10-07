import { useQuery } from '@tanstack/react-query'

import { getGame } from '../services/game.service'
import { gameKeys } from './game.keys'

/** Một game (kèm branchIds). Form sửa dùng `includeInactive` để mở được cả game đang ẩn. */
export function useGame(id: number, includeInactive = false) {
  return useQuery({
    queryKey: gameKeys.detail(id, includeInactive),
    queryFn: async () => (await getGame(id, includeInactive)).data,
    enabled: id > 0,
  })
}
