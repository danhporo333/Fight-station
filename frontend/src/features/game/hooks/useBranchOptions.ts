import { useQuery } from '@tanstack/react-query'

import { getBranchOptions } from '../services/game.service'
import { gameKeys } from './game.keys'

/** Chi nhánh để tick trong form game (kể cả chi nhánh đang ẩn) */
export function useBranchOptions() {
  return useQuery({
    queryKey: gameKeys.branchOptions,
    queryFn: async () => (await getBranchOptions()).data,
  })
}
