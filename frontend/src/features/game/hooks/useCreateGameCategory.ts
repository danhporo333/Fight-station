import { useMutation } from '@tanstack/react-query'

import { createGameCategory } from '../services/game-category.service'
import { useInvalidateGames } from './useInvalidateGames'

export function useCreateGameCategory() {
  const invalidate = useInvalidateGames()
  return useMutation({ mutationFn: createGameCategory, onSuccess: invalidate })
}
