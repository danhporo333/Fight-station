import { logger } from '@/core/logger';
import { ConflictError, ErrorCode, NotFoundError } from '@/shared/errors';
import type { PaginationMeta } from '@/shared/types/pagination';
import { buildMeta } from '@/shared/utils/pagination';

import type {
  CreateMenuCategoryDto,
  ListMenuCategoriesQuery,
  UpdateMenuCategoryDto,
} from './menu-category.dto';
import type { MenuCategory } from './menu-category.entity';
import type { MenuCategoryRepository } from './menu-category.repository';

export class MenuCategoryService {
  constructor(private readonly repo: MenuCategoryRepository) {}

  /** `isAdmin`: includeInactive chỉ có hiệu lực khi request có token admin */
  async list(
    query: ListMenuCategoriesQuery,
    isAdmin: boolean,
  ): Promise<{ items: MenuCategory[]; meta: PaginationMeta }> {
    const { page, limit, sort } = query;
    const includeInactive = isAdmin && query.includeInactive === true;
    const { items, total } = await this.repo.findMany({ page, limit, sort, includeInactive });
    return { items, meta: buildMeta(page, limit, total) };
  }

  /** Quản trị dùng: tìm cả nhóm đang ẩn */
  async get(id: number): Promise<MenuCategory> {
    const category = await this.repo.findById(id);
    if (!category) throw menuCategoryNotFound(id);
    return category;
  }

  async create(adminId: number, dto: CreateMenuCategoryDto): Promise<MenuCategory> {
    await this.assertNameFree(dto.name);
    const category = await this.repo.create(dto);
    logger.info({ id: category.id, adminId }, 'menu_category.created');
    return category;
  }

  async update(adminId: number, id: number, dto: UpdateMenuCategoryDto): Promise<MenuCategory> {
    await this.get(id);
    if (dto.name !== undefined) await this.assertNameFree(dto.name, id);
    const category = await this.repo.update(id, dto);
    logger.info({ id, adminId, fields: Object.keys(dto) }, 'menu_category.updated');
    return category;
  }

  /** Nhóm còn món thì chặn (khóa ngoại RESTRICT), báo số món để chủ quán xử lý trước */
  async remove(adminId: number, id: number): Promise<void> {
    const category = await this.get(id);
    if (category.itemCount > 0) {
      throw new ConflictError(
        ErrorCode.MENU_CATEGORY_HAS_ITEMS,
        `Nhóm còn ${category.itemCount} món, hãy chuyển hoặc xóa món trước`,
      );
    }
    await this.repo.delete(id);
    logger.info({ id, adminId }, 'menu_category.deleted');
  }

  private async assertNameFree(name: string, exceptId?: number): Promise<void> {
    if ((await this.repo.findIdByName(name, exceptId)) !== null) {
      throw new ConflictError(ErrorCode.MENU_NAME_TAKEN, `Nhóm menu "${name}" đã tồn tại`);
    }
  }
}

function menuCategoryNotFound(id: number): NotFoundError {
  return new NotFoundError(ErrorCode.MENU_CATEGORY_NOT_FOUND, `Không tìm thấy nhóm menu ${id}`);
}
