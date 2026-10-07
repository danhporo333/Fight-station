/** Nhóm menu trả ra API (GET/POST/PUT /menu-categories) */
export interface MenuCategory {
  id: number;
  name: string;
  sortOrder: number;
  isActive: boolean;
  /** Số món trong nhóm (kể cả món đang ẩn); > 0 thì không xóa được */
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/** `select` của Prisma: cột được đọc + đếm số món */
export const MENU_CATEGORY_SELECT = {
  id: true,
  name: true,
  sortOrder: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { items: true } },
} as const;

type MenuCategoryRow = Omit<MenuCategory, 'itemCount'> & { _count: { items: number } };

export function toMenuCategory({ _count, ...row }: MenuCategoryRow): MenuCategory {
  return { ...row, itemCount: _count.items };
}

/** Trường cho phép trong `?sort=` */
export const MENU_CATEGORY_SORT_FIELDS = ['sortOrder', 'name', 'createdAt'] as const;
