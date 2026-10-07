import type { Database } from '@/core/database/prisma';
import { parseSort, toSkipTake, type PaginationQuery } from '@/shared/utils/pagination';

import type { CreateMenuCategoryDto, UpdateMenuCategoryDto } from './menu-category.dto';
import {
  MENU_CATEGORY_SELECT,
  MENU_CATEGORY_SORT_FIELDS,
  toMenuCategory,
  type MenuCategory,
} from './menu-category.entity';

export interface MenuCategoryFilter extends Pick<PaginationQuery, 'page' | 'limit' | 'sort'> {
  includeInactive: boolean;
}

export class MenuCategoryRepository {
  constructor(private readonly db: Database) {}

  async findMany(filter: MenuCategoryFilter): Promise<{ items: MenuCategory[]; total: number }> {
    const where = filter.includeInactive ? {} : { isActive: true };
    const [rows, total] = await this.db.$transaction([
      this.db.menuCategory.findMany({
        where,
        select: MENU_CATEGORY_SELECT,
        orderBy: [...parseSort(filter.sort, MENU_CATEGORY_SORT_FIELDS), { id: 'asc' }],
        ...toSkipTake(filter),
      }),
      this.db.menuCategory.count({ where }),
    ]);
    return { items: rows.map(toMenuCategory), total };
  }

  /** Tìm cả nhóm đang ẩn (chỉ quản trị dùng) */
  async findById(id: number): Promise<MenuCategory | null> {
    const row = await this.db.menuCategory.findUnique({
      where: { id },
      select: MENU_CATEGORY_SELECT,
    });
    return row ? toMenuCategory(row) : null;
  }

  /** Id nhóm cùng tên (collation không phân biệt hoa thường và dấu), bỏ qua `exceptId` */
  async findIdByName(name: string, exceptId?: number): Promise<number | null> {
    const row = await this.db.menuCategory.findFirst({
      where: { name, ...(exceptId ? { id: { not: exceptId } } : {}) },
      select: { id: true },
    });
    return row?.id ?? null;
  }

  async create(data: CreateMenuCategoryDto): Promise<MenuCategory> {
    return toMenuCategory(
      await this.db.menuCategory.create({ data, select: MENU_CATEGORY_SELECT }),
    );
  }

  async update(id: number, data: UpdateMenuCategoryDto): Promise<MenuCategory> {
    return toMenuCategory(
      await this.db.menuCategory.update({ where: { id }, data, select: MENU_CATEGORY_SELECT }),
    );
  }

  async delete(id: number): Promise<void> {
    await this.db.menuCategory.delete({ where: { id } });
  }
}
