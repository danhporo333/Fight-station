import { http } from '@/shared/services/api'

import type { GameCategory, GameCategoryPayload, GameCategoryQuery } from '../types/game.types'

export const getGameCategories = (params: GameCategoryQuery) =>
  http.get<GameCategory[]>('/game-categories', { params })

export const createGameCategory = (payload: GameCategoryPayload) =>
  http.post<GameCategory>('/game-categories', payload)

export const updateGameCategory = (id: number, payload: Partial<GameCategoryPayload>) =>
  http.put<GameCategory>(`/game-categories/${id}`, payload)

export const deleteGameCategory = (id: number) => http.delete(`/game-categories/${id}`)
