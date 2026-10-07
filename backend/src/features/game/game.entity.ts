import type { AccentColor } from '@/generated/prisma/client';

/** Game trong danh sách (GET /games): kèm thể loại, KHÔNG kèm branchIds (nặng) */
export interface GameListItem {
  id: number;
  title: string;
  players: string | null;
  posterUrl: string | null;
  accentColor: AccentColor;
  description: string | null;
  gameCategoryId: number;
  category: { id: number; name: string };
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Game chi tiết (GET /games/:id, POST, PUT): thêm danh sách chi nhánh */
export interface GameDetail extends GameListItem {
  /** null = có ở mọi chi nhánh; mảng = chỉ những chi nhánh này (tăng dần) */
  branchIds: number[] | null;
}

export const GAME_LIST_SELECT = {
  id: true,
  title: true,
  players: true,
  posterUrl: true,
  accentColor: true,
  description: true,
  gameCategoryId: true,
  gameCategory: { select: { id: true, name: true } },
  sortOrder: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const GAME_DETAIL_SELECT = {
  ...GAME_LIST_SELECT,
  branches: { select: { branchId: true }, orderBy: { branchId: 'asc' } },
} as const;

type GameListRow = Omit<GameListItem, 'category'> & { gameCategory: { id: number; name: string } };
type GameDetailRow = GameListRow & { branches: { branchId: number }[] };

export function toGameListItem({ gameCategory, ...row }: GameListRow): GameListItem {
  return { ...row, category: gameCategory };
}

export function toGameDetail({ branches, ...row }: GameDetailRow): GameDetail {
  return {
    ...toGameListItem(row),
    // Không có dòng nào trong branch_game = có ở mọi chi nhánh
    branchIds: branches.length === 0 ? null : branches.map((item) => item.branchId),
  };
}

/** Trường cho phép trong `?sort=` */
export const GAME_SORT_FIELDS = ['sortOrder', 'title', 'createdAt'] as const;
