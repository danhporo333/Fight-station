import { useQueryClient } from '@tanstack/react-query'

import { gameKeys } from './game.keys'

/**
 * Sau mọi thao tác ghi (game hoặc thể loại): làm mới danh sách game, chi tiết game và thể loại
 * (số game của thể loại, tên thể loại hiện trên thẻ game đều có thể đổi).
 */
export function useInvalidateGames() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: gameKeys.lists }),
      queryClient.invalidateQueries({ queryKey: gameKeys.details }),
      queryClient.invalidateQueries({ queryKey: gameKeys.categories }),
    ])
}
