import type { Database } from '@/core/database/prisma';
import type { Prisma } from '@/generated/prisma/client';
import { parseSort, toSkipTake } from '@/shared/utils/pagination';

import type { CreateMenuItemDto, UpdateMenuItemDto } from './menu-item.dto';
import {
  MENU_ITEM_SELECT,
  MENU_ITEM_SORT_FIELDS,
  toMenuItem,
  type MenuItem,
  type MenuSection,
} from './menu-item.entity';
import type { MenuItemFilter } from './menu-item.types';

/** Khách chỉ thấy món đang hiện VÀ thuộc nhóm đang hiện (ẩn nhóm thì món ẩn theo) */
const VISIBLE: Prisma.MenuItemWhereInput = { isActive: true, menuCategory: { isActive: true } };

/** Không gửi `sort`: xếp theo nhóm trước (thứ tự nhóm), rồi thứ tự món trong nhóm */
const DEFAULT_ORDER: Prisma.MenuItemOrderByWithRelationInput[] = [
  { menuCategory: { sortOrder: 'asc' } },
  { menuCategoryId: 'asc' },
  { sortOrder: 'asc' },
];

export class MenuItemRepository {
  constructor(private readonly db: Database) {}

  async findMany(filter: MenuItemFilter): Promise<{ items: MenuItem[]; total: number }> {
    const where: Prisma.MenuItemWhereInput = {
      ...(filter.includeInactive ? {} : VISIBLE),
      // Collation utf8mb4_0900_ai_ci: contains không phân biệt hoa thường và dấu
      ...(filter.q ? { name: { contains: filter.q } } : {}),
      ...(filter.categoryId ? { menuCategoryId: filter.categoryId } : {}),
      ...(filter.isAvailable !== undefined ? { isAvailable: filter.isAvailable } : {}),
    };
    const sort = parseSort(filter.sort, MENU_ITEM_SORT_FIELDS, []);
    const [rows, total] = await this.db.$transaction([
      this.db.menuItem.findMany({
        where,
        select: MENU_ITEM_SELECT,
        orderBy: [...(sort.length > 0 ? sort : DEFAULT_ORDER), { id: 'asc' }],
        ...toSkipTake(filter),
      }),
      this.db.menuItem.count({ where }),
    ]);
    return { items: rows.map(toMenuItem), total };
  }

  async findById(id: number, includeInactive: boolean): Promise<MenuItem | null> {
    const row = await this.db.menuItem.findFirst({
      where: { id, ...(includeInactive ? {} : VISIBLE) },
      select: MENU_ITEM_SELECT,
    });
    return row ? toMenuItem(row) : null;
  }

  /** Id món cùng tên trong cùng nhóm (không phân biệt hoa thường và dấu), bỏ qua `exceptId` */
  async findIdByName(
    menuCategoryId: number,
    name: string,
    exceptId?: number,
  ): Promise<number | null> {
    const row = await this.db.menuItem.findFirst({
      where: { menuCategoryId, name, ...(exceptId ? { id: { not: exceptId } } : {}) },
      select: { id: true },
    });
    return row?.id ?? null;
  }

  /** Nhóm có tồn tại không (kể cả đang ẩn) */
  async categoryExists(id: number): Promise<boolean> {
    return (await this.db.menuCategory.count({ where: { id } })) > 0;
  }

  /**
   * Toàn bộ menu cho trang khách: nhóm đang hiện, mỗi nhóm kèm các món đang hiện.
   * Nhóm không còn món nào đang hiện thì bỏ (không có tab rỗng).
   */
  async findMenu(): Promise<MenuSection[]> {
    const itemWhere = { isActive: true };
    return this.db.menuCategory.findMany({
      where: { isActive: true, items: { some: itemWhere } },
      select: {
        id: true,
        name: true,
        sortOrder: true,
        items: {
          where: itemWhere,
          select: {
            id: true,
            name: true,
            description: true,
            priceVnd: true,
            imageUrl: true,
            isAvailable: true,
            isBestSeller: true,
            sortOrder: true,
          },
          orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
  }

  async create(data: CreateMenuItemDto): Promise<MenuItem> {
    return toMenuItem(await this.db.menuItem.create({ data, select: MENU_ITEM_SELECT }));
  }

  async update(id: number, data: UpdateMenuItemDto): Promise<MenuItem> {
    return toMenuItem(
      await this.db.menuItem.update({ where: { id }, data, select: MENU_ITEM_SELECT }),
    );
  }

  async delete(id: number): Promise<void> {
    await this.db.menuItem.delete({ where: { id } });
  }
}
