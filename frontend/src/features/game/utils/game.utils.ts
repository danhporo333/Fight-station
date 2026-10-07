import type { GameCategoryFormInput, GameFormInput } from '../types/game.schema'
import type {
  GameCategory,
  GameCategoryPayload,
  GameDetail,
  GamePayload,
} from '../types/game.types'

/** Tham số URL của bộ lọc game (GameFilters ghi, trang ghép đọc) */
export const GAME_SEARCH_PARAMS = { category: 'category', q: 'q' } as const

/** Đọc số nguyên dương từ tham số URL; sai hoặc trống → undefined */
export function readIdParam(value: string | null): number | undefined {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : undefined
}

export const EMPTY_GAME_FORM: GameFormInput = {
  title: '',
  gameCategoryId: '',
  players: '',
  posterUrl: '',
  accentColor: 'orange',
  description: '',
  sortOrder: '0',
  isActive: true,
  allBranches: true,
  branchIds: [],
}

/** Game từ API → giá trị form (null → '', số → chuỗi, branchIds null → "mọi chi nhánh") */
export function toGameFormValues(game: GameDetail): GameFormInput {
  return {
    title: game.title,
    gameCategoryId: String(game.gameCategoryId),
    players: game.players ?? '',
    posterUrl: game.posterUrl ?? '',
    accentColor: game.accentColor,
    description: game.description ?? '',
    sortOrder: String(game.sortOrder),
    isActive: game.isActive,
    allBranches: game.branchIds === null,
    branchIds: (game.branchIds ?? []).map(String),
  }
}

const emptyToNull = (value: string): string | null => (value === '' ? null : value)

/** Giá trị form → body POST/PUT (ô trống → null, "mọi chi nhánh" → branchIds: null) */
export function toGamePayload(values: GameFormInput): GamePayload {
  return {
    title: values.title,
    gameCategoryId: Number(values.gameCategoryId),
    players: emptyToNull(values.players),
    posterUrl: emptyToNull(values.posterUrl),
    accentColor: values.accentColor,
    description: emptyToNull(values.description),
    sortOrder: Number(values.sortOrder),
    isActive: values.isActive,
    branchIds: values.allBranches ? null : values.branchIds.map(Number),
  }
}

export const EMPTY_GAME_CATEGORY_FORM: GameCategoryFormInput = {
  name: '',
  sortOrder: '0',
  isActive: true,
}

export function toGameCategoryFormValues(category: GameCategory): GameCategoryFormInput {
  return {
    name: category.name,
    sortOrder: String(category.sortOrder),
    isActive: category.isActive,
  }
}

export function toGameCategoryPayload(values: GameCategoryFormInput): GameCategoryPayload {
  return { name: values.name, sortOrder: Number(values.sortOrder), isActive: values.isActive }
}
