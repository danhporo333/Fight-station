import type { Database } from '@/core/database/prisma';
import { parseSort, toSkipTake, type PaginationQuery } from '@/shared/utils/pagination';

import type { CreateGameCategoryDto, UpdateGameCategoryDto } from './game-category.dto';
import {
  GAME_CATEGORY_SELECT,
  GAME_CATEGORY_SORT_FIELDS,
  toGameCategory,
  type GameCategory,
} from './game-category.entity';

export interface GameCategoryFilter extends Pick<PaginationQuery, 'page' | 'limit' | 'sort'> {
  includeInactive: boolean;
}

export class GameCategoryRepository {
  constructor(private readonly db: Database) {}

  async findMany(filter: GameCategoryFilter): Promise<{ items: GameCategory[]; total: number }> {
    const where = filter.includeInactive ? {} : { isActive: true };
    const [rows, total] = await this.db.$transaction([
      this.db.gameCategory.findMany({
        where,
        select: GAME_CATEGORY_SELECT,
        orderBy: [...parseSort(filter.sort, GAME_CATEGORY_SORT_FIELDS), { id: 'asc' }],
        ...toSkipTake(filter),
      }),
      this.db.gameCategory.count({ where }),
    ]);
    return { items: rows.map(toGameCategory), total };
  }

  async findById(id: number, includeInactive: boolean): Promise<GameCategory | null> {
    const row = await this.db.gameCategory.findFirst({
      where: { id, ...(includeInactive ? {} : { isActive: true }) },
      select: GAME_CATEGORY_SELECT,
    });
    return row ? toGameCategory(row) : null;
  }

  /** Id thể loại cùng tên (collation không phân biệt hoa thường và dấu), bỏ qua `exceptId` */
  async findIdByName(name: string, exceptId?: number): Promise<number | null> {
    const row = await this.db.gameCategory.findFirst({
      where: { name, ...(exceptId ? { id: { not: exceptId } } : {}) },
      select: { id: true },
    });
    return row?.id ?? null;
  }

  async create(data: CreateGameCategoryDto): Promise<GameCategory> {
    return toGameCategory(
      await this.db.gameCategory.create({ data, select: GAME_CATEGORY_SELECT }),
    );
  }

  async update(id: number, data: UpdateGameCategoryDto): Promise<GameCategory> {
    return toGameCategory(
      await this.db.gameCategory.update({ where: { id }, data, select: GAME_CATEGORY_SELECT }),
    );
  }

  async delete(id: number): Promise<void> {
    await this.db.gameCategory.delete({ where: { id } });
  }
}
