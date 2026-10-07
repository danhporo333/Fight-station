import { useMutation } from '@tanstack/react-query'

import { deleteGameCategory } from '../services/game-category.service'
import { useInvalidateGames } from './useInvalidateGames'

/** Thể loại còn game → API trả 409 GAME_005 (giao diện đã khóa nút xóa trước) */
export function useDeleteGameCategory() {
  const invalidate = useInvalidateGames()
  return useMutation({ mutationFn: deleteGameCategory, onSuccess: invalidate })
}
