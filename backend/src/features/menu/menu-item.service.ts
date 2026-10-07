import { logger } from '@/core/logger';
import { ConflictError, ErrorCode, NotFoundError } from '@/shared/errors';
import type { PaginationMeta } from '@/shared/types/pagination';
import { buildMeta } from '@/shared/utils/pagination';

import type { CreateMenuItemDto, ListMenuItemsQuery, UpdateMenuItemDto } from './menu-item.dto';
import type { MenuItem, MenuSection } from './menu-item.entity';
import type { MenuItemRepository } from './menu-item.repository';

export class MenuItemService {
  constructor(private readonly repo: MenuItemRepository) {}

  /** `GET /menu`: nhóm đang hiện kèm món đang hiện (món tạm hết vẫn có, `isAvailable: false`) */
  getMenu(): Promise<MenuSection[]> {
    return this.repo.findMenu();
  }

  /** `isAdmin`: includeInactive chỉ có hiệu lực khi request có token admin */
  async list(
    query: ListMenuItemsQuery,
    isAdmin: boolean,
  ): Promise<{ items: MenuItem[]; meta: PaginationMeta }> {
    const { page, limit, sort, q, categoryId, isAvailable } = query;
    const includeInactive = isAdmin && query.includeInactive === true;
    const { items, total } = await this.repo.findMany({
      page,
      limit,
      sort,
      q,
      categoryId,
      isAvailable,
      includeInactive,
    });
    return { items, meta: buildMeta(page, limit, total) };
  }

  async get(id: number, includeInactive = false): Promise<MenuItem> {
    const item = await this.repo.findById(id, includeInactive);
    if (!item) throw itemNotFound(id);
    return item;
  }

  async create(adminId: number, dto: CreateMenuItemDto): Promise<MenuItem> {
    await this.assertCategoryExists(dto.menuCategoryId);
    await this.assertNameFree(dto.menuCategoryId, dto.name);
    const item = await this.repo.create(dto);
    logger.info({ id: item.id, adminId }, 'menu_item.created');
    return item;
  }

  async update(adminId: number, id: number, dto: UpdateMenuItemDto): Promise<MenuItem> {
    // Quản trị sửa được cả món đang ẩn
    const current = await this.get(id, true);
    if (dto.menuCategoryId !== undefined) await this.assertCategoryExists(dto.menuCategoryId);
    // Đổi tên hoặc chuyển nhóm: tên không được trùng món khác trong nhóm đích
    if (dto.name !== undefined || dto.menuCategoryId !== undefined) {
      await this.assertNameFree(
        dto.menuCategoryId ?? current.category.id,
        dto.name ?? current.name,
        id,
      );
    }
    const item = await this.repo.update(id, dto);
    logger.info({ id, adminId, fields: Object.keys(dto) }, 'menu_item.updated');
    return item;
  }

  async remove(adminId: number, id: number): Promise<void> {
    await this.get(id, true);
    await this.repo.delete(id);
    logger.info({ id, adminId }, 'menu_item.deleted');
  }

  private async assertCategoryExists(menuCategoryId: number): Promise<void> {
    if (!(await this.repo.categoryExists(menuCategoryId))) {
      throw new NotFoundError(
        ErrorCode.MENU_CATEGORY_NOT_FOUND,
        `Không tìm thấy nhóm menu ${menuCategoryId}`,
      );
    }
  }

  private async assertNameFree(
    menuCategoryId: number,
    name: string,
    exceptId?: number,
  ): Promise<void> {
    if ((await this.repo.findIdByName(menuCategoryId, name, exceptId)) !== null) {
      throw new ConflictError(ErrorCode.MENU_NAME_TAKEN, `Món "${name}" đã có trong nhóm này`);
    }
  }
}

function itemNotFound(id: number): NotFoundError {
  return new NotFoundError(ErrorCode.MENU_ITEM_NOT_FOUND, `Không tìm thấy món ${id}`);
}
