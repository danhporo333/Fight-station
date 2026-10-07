import { http } from '@/shared/services/api'

import type {
  BranchOption,
  Game,
  GameDetail,
  GameListQuery,
  GamePayload,
} from '../types/game.types'

export const getGames = (params: GameListQuery) => http.get<Game[]>('/games', { params })

export const getGame = (id: number, includeInactive = false) =>
  http.get<GameDetail>(`/games/${id}`, {
    params: includeInactive ? { includeInactive } : undefined,
  })

export const createGame = (payload: GamePayload) => http.post<GameDetail>('/games', payload)

export const updateGame = (id: number, payload: Partial<GamePayload>) =>
  http.put<GameDetail>(`/games/${id}`, payload)

export const deleteGame = (id: number) => http.delete(`/games/${id}`)

/**
 * Chi nhánh để chọn trong form game. Gọi thẳng API /branches (không import feature branch);
 * cùng tham số với trang quản trị chi nhánh nên dùng chung cache với nó.
 */
export const BRANCH_OPTIONS_PARAMS = { limit: 100, includeInactive: true } as const

export const getBranchOptions = () =>
  http.get<BranchOption[]>('/branches', { params: BRANCH_OPTIONS_PARAMS })
