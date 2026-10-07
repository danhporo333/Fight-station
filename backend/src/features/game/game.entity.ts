import type { AccentColor, Prisma } from '@/generated/prisma/client';

export interface GameCategoryRef {
  id: number;
  name: string;
}

/** Game trong danh sách (GET /games): kèm các thể loại, KHÔNG kèm branchIds (nặng) */
export interface GameListItem {
  id: number;
  title: string;
  players: string | null;
  posterUrl: string | null;
  accentColor: AccentColor;
  description: string | null;
  /** 1–5 thể loại, xếp theo sortOrder của thể loại */
  categories: GameCategoryRef[];
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
  categories: {
    select: { gameCategory: { select: { id: true, name: true } } },
    orderBy: [{ gameCategory: { sortOrder: 'asc' } }, { gameCategoryId: 'asc' }],
  },
  sortOrder: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.GameSelect;

export const GAME_DETAIL_SELECT = {
  ...GAME_LIST_SELECT,
  branches: { select: { branchId: true }, orderBy: { branchId: 'asc' } },
} satisfies Prisma.GameSelect;

type GameListRow = Omit<GameListItem, 'categories'> & {
  categories: { gameCategory: GameCategoryRef }[];
};
type GameDetailRow = GameListRow & { branches: { branchId: number }[] };

export function toGameListItem({ categories, ...row }: GameListRow): GameListItem {
  return { ...row, categories: categories.map((item) => item.gameCategory) };
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
