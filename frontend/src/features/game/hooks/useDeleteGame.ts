import { useMutation } from '@tanstack/react-query'

import { deleteGame } from '../services/game.service'
import { useInvalidateGames } from './useInvalidateGames'

export function useDeleteGame() {
  const invalidate = useInvalidateGames()
  return useMutation({ mutationFn: deleteGame, onSuccess: invalidate })
}
