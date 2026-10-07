import { logger } from '@/core/logger';
import { ConflictError, ErrorCode, NotFoundError } from '@/shared/errors';
import type { PaginationMeta } from '@/shared/types/pagination';
import { buildMeta } from '@/shared/utils/pagination';

import type {
  CreateGameCategoryDto,
  ListGameCategoriesQuery,
  UpdateGameCategoryDto,
} from './game-category.dto';
import type { GameCategory } from './game-category.entity';
import type { GameCategoryRepository } from './game-category.repository';

export class GameCategoryService {
  constructor(private readonly repo: GameCategoryRepository) {}

  /** `isAdmin`: includeInactive chỉ có hiệu lực khi request có token admin */
  async list(
    query: ListGameCategoriesQuery,
    isAdmin: boolean,
  ): Promise<{ items: GameCategory[]; meta: PaginationMeta }> {
    const { page, limit, sort } = query;
    const includeInactive = isAdmin && query.includeInactive === true;
    const { items, total } = await this.repo.findMany({ page, limit, sort, includeInactive });
    return { items, meta: buildMeta(page, limit, total) };
  }

  /** Quản trị dùng: tìm cả thể loại đang ẩn */
  async get(id: number): Promise<GameCategory> {
    const category = await this.repo.findById(id, true);
    if (!category) throw categoryNotFound(id);
    return category;
  }

  async create(adminId: number, dto: CreateGameCategoryDto): Promise<GameCategory> {
    await this.assertNameFree(dto.name);
    const category = await this.repo.create(dto);
    logger.info({ id: category.id, adminId }, 'game_category.created');
    return category;
  }

  async update(adminId: number, id: number, dto: UpdateGameCategoryDto): Promise<GameCategory> {
    await this.get(id);
    if (dto.name !== undefined) await this.assertNameFree(dto.name, id);
    const category = await this.repo.update(id, dto);
    logger.info({ id, adminId, fields: Object.keys(dto) }, 'game_category.updated');
    return category;
  }

  /** Thể loại còn game thì chặn (khóa ngoại RESTRICT), báo số game để chủ quán xử lý trước */
  async remove(adminId: number, id: number): Promise<void> {
    const category = await this.get(id);
    if (category.gameCount > 0) {
      throw new ConflictError(
        ErrorCode.GAME_CATEGORY_HAS_GAMES,
        `Thể loại còn ${category.gameCount} game, hãy chuyển hoặc xóa game trước`,
      );
    }
    await this.repo.delete(id);
    logger.info({ id, adminId }, 'game_category.deleted');
  }

  private async assertNameFree(name: string, exceptId?: number): Promise<void> {
    if ((await this.repo.findIdByName(name, exceptId)) !== null) {
      throw new ConflictError(ErrorCode.GAME_CATEGORY_NAME_TAKEN, `Thể loại "${name}" đã tồn tại`);
    }
  }
}

function categoryNotFound(id: number): NotFoundError {
  return new NotFoundError(ErrorCode.GAME_CATEGORY_NOT_FOUND, `Không tìm thấy thể loại ${id}`);
}
