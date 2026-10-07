import { useQuery } from '@tanstack/react-query'

import { getGames } from '../services/game.service'
import { gameKeys } from './game.keys'

const COUNT_QUERY = { limit: 1 }

/** Số game đang hiện với khách (meta.total), cho số liệu "Tựa game" ở hero. Chưa có → undefined. */
export function useGameCount(): number | undefined {
  const { data } = useQuery({
    queryKey: gameKeys.list(COUNT_QUERY),
    queryFn: async () => (await getGames(COUNT_QUERY)).meta?.total ?? 0,
  })
  return data
}
