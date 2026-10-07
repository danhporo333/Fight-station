import { useMutation } from '@tanstack/react-query'

import { updateGame } from '../services/game.service'
import type { GamePayload } from '../types/game.types'
import { useInvalidateGames } from './useInvalidateGames'

/** PUT cập nhật một phần; `branchIds` gửi lên sẽ thay toàn bộ danh sách chi nhánh */
export function useUpdateGame() {
  const invalidate = useInvalidateGames()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<GamePayload> }) =>
      updateGame(id, payload),
    onSuccess: invalidate,
  })
}
