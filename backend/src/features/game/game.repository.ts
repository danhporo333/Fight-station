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

type GameData = Omit<CreateGameDto, 'branchIds'>;

/** Khách chỉ thấy game đang hiện VÀ thuộc thể loại đang hiện */
const VISIBLE: Prisma.GameWhereInput = { isActive: true, gameCategory: { isActive: true } };

export class GameRepository {
  constructor(private readonly db: Database) {}

  async findMany(filter: GameFilter): Promise<{ items: GameListItem[]; total: number }> {
    const where: Prisma.GameWhereInput = {
      ...(filter.includeInactive ? {} : VISIBLE),
      // Collation utf8mb4_0900_ai_ci: contains không phân biệt hoa thường và dấu
      ...(filter.q ? { title: { contains: filter.q } } : {}),
      ...(filter.categoryId ? { gameCategoryId: filter.categoryId } : {}),
      ...(filter.branchId
        ? {
            OR: [{ branches: { none: {} } }, { branches: { some: { branchId: filter.branchId } } }],
          }
        : {}),
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

  async categoryExists(categoryId: number): Promise<boolean> {
    return (await this.db.gameCategory.count({ where: { id: categoryId } })) > 0;
  }

  /** `branchIds` null = mọi chi nhánh (không ghi dòng nào) */
  async create(data: GameData, branchIds: number[] | null): Promise<GameDetail> {
    const row = await this.db.game.create({
      data: {
        ...data,
        ...(branchIds ? { branches: { create: branchIds.map((branchId) => ({ branchId })) } } : {}),
      },
      select: GAME_DETAIL_SELECT,
    });
    return toGameDetail(row);
  }

  /** Sửa game và (nếu có) thay toàn bộ danh sách chi nhánh, trong cùng một transaction */
  async update(
    id: number,
    data: Omit<UpdateGameDto, 'branchIds'>,
    branchIds: BranchIdsChange,
  ): Promise<GameDetail> {
    const row = await this.db.$transaction(async (tx) => {
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

  /** Xóa thật; dòng branch_game tự xóa theo (CASCADE) */
  async delete(id: number): Promise<void> {
    await this.db.game.delete({ where: { id } });
  }
}
