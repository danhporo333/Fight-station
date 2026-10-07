import { logger } from '@/core/logger';
import { BadRequestError, ConflictError, ErrorCode, NotFoundError } from '@/shared/errors';
import type { PaginationMeta } from '@/shared/types/pagination';
import { buildMeta } from '@/shared/utils/pagination';

import type { CreateGameDto, ListGamesQuery, UpdateGameDto } from './game.dto';
import type { GameDetail, GameListItem } from './game.entity';
import type { GameRepository } from './game.repository';
import type { BranchIdsChange, BranchLookup } from './game.types';

export class GameService {
  constructor(
    private readonly repo: GameRepository,
    private readonly branches: BranchLookup,
  ) {}

  /** `isAdmin`: includeInactive chỉ có hiệu lực khi request có token admin */
  async list(
    query: ListGamesQuery,
    isAdmin: boolean,
  ): Promise<{ items: GameListItem[]; meta: PaginationMeta }> {
    const { page, limit, sort, q, categoryId, branchId } = query;
    const includeInactive = isAdmin && query.includeInactive === true;
    const { items, total } = await this.repo.findMany({
      page,
      limit,
      sort,
      q,
      categoryId,
      branchId,
      includeInactive,
    });
    return { items, meta: buildMeta(page, limit, total) };
  }

  async get(id: number, includeInactive = false): Promise<GameDetail> {
    const game = await this.repo.findById(id, includeInactive);
    if (!game) throw gameNotFound(id);
    return game;
  }

  async create(
    adminId: number,
    { branchIds, gameCategoryIds, ...data }: CreateGameDto,
  ): Promise<GameDetail> {
    await this.assertTitleFree(data.title);
    const categoryIds = await this.checkCategoryIds(gameCategoryIds);
    const ids = await this.checkBranchIds(branchIds ?? null);
    const game = await this.repo.create(data, categoryIds, ids ?? null);
    logger.info({ id: game.id, adminId }, 'game.created');
    return game;
  }

  async update(
    adminId: number,
    id: number,
    { branchIds, gameCategoryIds, ...data }: UpdateGameDto,
  ): Promise<GameDetail> {
    // Quản trị sửa được cả game đang ẩn
    await this.get(id, true);
    if (data.title !== undefined) await this.assertTitleFree(data.title, id);
    const categoryIds = gameCategoryIds && (await this.checkCategoryIds(gameCategoryIds));
    const ids = await this.checkBranchIds(branchIds);
    const game = await this.repo.update(id, data, categoryIds, ids);
    logger.info(
      {
        id,
        adminId,
        fields: Object.keys(data),
        categoriesChanged: gameCategoryIds !== undefined,
        branchesChanged: branchIds !== undefined,
      },
      'game.updated',
    );
    return game;
  }

  async remove(adminId: number, id: number): Promise<void> {
    await this.get(id, true);
    await this.repo.delete(id);
    logger.info({ id, adminId }, 'game.deleted');
  }

  private async assertTitleFree(title: string, exceptId?: number): Promise<void> {
    if ((await this.repo.findIdByTitle(title, exceptId)) !== null) {
      throw new ConflictError(ErrorCode.GAME_TITLE_TAKEN, `Game "${title}" đã tồn tại`);
    }
  }

  /** Bỏ id trùng, sắp tăng dần, rồi kiểm tra mọi thể loại có thật (kể cả đang ẩn) */
  private async checkCategoryIds(gameCategoryIds: number[]): Promise<number[]> {
    const unique = [...new Set(gameCategoryIds)].sort((a, b) => a - b);
    if ((await this.repo.countCategories(unique)) !== unique.length) {
      throw new NotFoundError(
        ErrorCode.GAME_CATEGORY_NOT_FOUND,
        'Danh sách thể loại có thể loại không tồn tại',
      );
    }
    return unique;
  }

  /** Bỏ id trùng rồi kiểm tra chi nhánh có thật; null/undefined giữ nguyên nghĩa */
  private async checkBranchIds(branchIds: BranchIdsChange): Promise<BranchIdsChange> {
    if (!branchIds) return branchIds;
    const unique = [...new Set(branchIds)].sort((a, b) => a - b);
    if (!(await this.branches.existsAll(unique))) {
      throw new BadRequestError(
        ErrorCode.GAME_BRANCH_NOT_FOUND,
        'Danh sách chi nhánh có chi nhánh không tồn tại',
      );
    }
    return unique;
  }
}

function gameNotFound(id: number): NotFoundError {
  return new NotFoundError(ErrorCode.GAME_NOT_FOUND, `Không tìm thấy game ${id}`);
}
