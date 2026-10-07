import { useMutation } from '@tanstack/react-query'

import { updateGameCategory } from '../services/game-category.service'
import type { GameCategoryPayload } from '../types/game.types'
import { useInvalidateGames } from './useInvalidateGames'

export function useUpdateGameCategory() {
  const invalidate = useInvalidateGames()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<GameCategoryPayload> }) =>
      updateGameCategory(id, payload),
    onSuccess: invalidate,
  })
}
