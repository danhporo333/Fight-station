import { useMutation } from '@tanstack/react-query'

import { createGame } from '../services/game.service'
import { useInvalidateGames } from './useInvalidateGames'

export function useCreateGame() {
  const invalidate = useInvalidateGames()
  return useMutation({ mutationFn: createGame, onSuccess: invalidate })
}
