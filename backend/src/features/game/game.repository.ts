import type { Database } from '@/core/database/prisma';
import type { Prisma } from '@/generated/prisma/client';
import { parseSort, toSkipTake } from '@/shared/utils/pagination';

import type { CreateGameDto, UpdateGameDto } from './game.dto';
import {
  GAME_DETAIL_SELECT,
  GAME_LIST_SELECT,
  GAME_SORT_FIELDS,
  toGameDetail,
  toGameListItem,
  type GameDetail,
  type GameListItem,
} from './game.entity';
import type { BranchIdsChange, GameFilter } from './game.types';

type GameData = Omit<CreateGameDto, 'branchIds' | 'gameCategoryIds'>;
type GameUpdateData = Omit<UpdateGameDto, 'branchIds' | 'gameCategoryIds'>;

/**
 * Khách chỉ thấy game đang hiện VÀ còn ít nhất một thể loại đang hiện
 * (ẩn hết mọi thể loại của game thì game ẩn theo).
 */
const VISIBLE: Prisma.GameWhereInput = {
  isActive: true,
  categories: { some: { gameCategory: { isActive: true } } },
};

export class GameRepository {
  constructor(private readonly db: Database) {}

  async findMany(filter: GameFilter): Promise<{ items: GameListItem[]; total: number }> {
    // Mỗi điều kiện một phần tử AND: tránh hai điều kiện cùng khóa `categories` ghi đè nhau
    const where: Prisma.GameWhereInput = {
      AND: [
        filter.includeInactive ? {} : VISIBLE,
        // Collation utf8mb4_0900_ai_ci: contains không phân biệt hoa thường và dấu
        filter.q ? { title: { contains: filter.q } } : {},
        filter.categoryId ? { categories: { some: { gameCategoryId: filter.categoryId } } } : {},
        filter.branchId
          ? {
              OR: [
                { branches: { none: {} } },
                { branches: { some: { branchId: filter.branchId } } },
              ],
            }
          : {},
      ],
    };
    const [rows, total] = await this.db.$transaction([
      this.db.game.findMany({
        where,
        select: GAME_LIST_SELECT,
        orderBy: [...parseSort(filter.sort, GAME_SORT_FIELDS), { id: 'asc' }],
        ...toSkipTake(filter),
      }),
      this.db.game.count({ where }),
    ]);
    return { items: rows.map(toGameListItem), total };
  }

  async findById(id: number, includeInactive: boolean): Promise<GameDetail | null> {
    const row = await this.db.game.findFirst({
      where: { id, ...(includeInactive ? {} : VISIBLE) },
      select: GAME_DETAIL_SELECT,
    });
    return row ? toGameDetail(row) : null;
  }

  /** Id game cùng tên (collation không phân biệt hoa thường và dấu), bỏ qua `exceptId` */
  async findIdByTitle(title: string, exceptId?: number): Promise<number | null> {
    const row = await this.db.game.findFirst({
      where: { title, ...(exceptId ? { id: { not: exceptId } } : {}) },
      select: { id: true },
    });
    return row?.id ?? null;
  }

  /** Bao nhiêu id trong danh sách là thể loại có thật (kể cả đang ẩn) */
  countCategories(ids: number[]): Promise<number> {
    return this.db.gameCategory.count({ where: { id: { in: ids } } });
  }

  /** `branchIds` null = mọi chi nhánh (không ghi dòng nào) */
  async create(
    data: GameData,
    gameCategoryIds: number[],
    branchIds: number[] | null,
  ): Promise<GameDetail> {
    const row = await this.db.game.create({
      data: {
        ...data,
        categories: { create: gameCategoryIds.map((gameCategoryId) => ({ gameCategoryId })) },
        ...(branchIds ? { branches: { create: branchIds.map((branchId) => ({ branchId })) } } : {}),
      },
      select: GAME_DETAIL_SELECT,
    });
    return toGameDetail(row);
  }

  /**
   * Sửa game và (nếu có gửi) thay toàn bộ thể loại / chi nhánh, trong cùng một transaction:
   * không bao giờ có lúc game mất hết thể loại hay vô tình thành "mọi chi nhánh".
   */
  async update(
    id: number,
    data: GameUpdateData,
    gameCategoryIds: number[] | undefined,
    branchIds: BranchIdsChange,
  ): Promise<GameDetail> {
    const row = await this.db.$transaction(async (tx) => {
      if (gameCategoryIds) {
        await tx.gameGameCategory.deleteMany({ where: { gameId: id } });
        await tx.gameGameCategory.createMany({
          data: gameCategoryIds.map((gameCategoryId) => ({ gameCategoryId, gameId: id })),
        });
      }
      if (branchIds !== undefined) {
        await tx.branchGame.deleteMany({ where: { gameId: id } });
        if (branchIds) {
          await tx.branchGame.createMany({
            data: branchIds.map((branchId) => ({ branchId, gameId: id })),
          });
        }
      }
      return tx.game.update({ where: { id }, data, select: GAME_DETAIL_SELECT });
    });
    return toGameDetail(row);
  }

  /** Xóa thật; dòng nối thể loại và chi nhánh tự xóa theo (CASCADE) */
  async delete(id: number): Promise<void> {
    await this.db.game.delete({ where: { id } });
  }
}
