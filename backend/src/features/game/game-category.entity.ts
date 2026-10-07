/** Thể loại game trả ra API (GET/POST/PUT /game-categories) */
export interface GameCategory {
  id: number;
  name: string;
  sortOrder: number;
  isActive: boolean;
  /** Số game thuộc thể loại (kể cả game đang ẩn); > 0 thì không xóa được */
  gameCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/** `select` của Prisma: cột được đọc + đếm số game */
export const GAME_CATEGORY_SELECT = {
  id: true,
  name: true,
  sortOrder: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { games: true } },
} as const;

type GameCategoryRow = Omit<GameCategory, 'gameCount'> & { _count: { games: number } };

export function toGameCategory({ _count, ...row }: GameCategoryRow): GameCategory {
  return { ...row, gameCount: _count.games };
}

/** Trường cho phép trong `?sort=` */
export const GAME_CATEGORY_SORT_FIELDS = ['sortOrder', 'name', 'createdAt'] as const;
