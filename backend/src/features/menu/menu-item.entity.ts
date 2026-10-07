import type { Prisma } from '@/generated/prisma/client';

/** Món trả ra API (GET/POST/PUT /menu-items) */
export interface MenuItem {
  id: number;
  /** Nhóm của món (id dùng khi gửi lên là `menuCategoryId`) */
  category: { id: number; name: string };
  name: string;
  description: string | null;
  /** Đơn vị đồng */
  priceVnd: number;
  imageUrl: string | null;
  /** false = tạm hết (vẫn hiện trên web) */
  isAvailable: boolean;
  /** Món bán chạy (huy hiệu "Best seller") */
  isBestSeller: boolean;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const MENU_ITEM_SELECT = {
  id: true,
  menuCategory: { select: { id: true, name: true } },
  name: true,
  description: true,
  priceVnd: true,
  imageUrl: true,
  isAvailable: true,
  isBestSeller: true,
  sortOrder: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.MenuItemSelect;

type MenuItemRow = Omit<MenuItem, 'category'> & { menuCategory: MenuItem['category'] };

export function toMenuItem({ menuCategory, ...row }: MenuItemRow): MenuItem {
  return { ...row, category: menuCategory };
}

/** Món trong `GET /menu` (chỉ món đang hiện, đã nằm trong nhóm nên không lặp lại nhóm) */
export type MenuEntryItem = Pick<
  MenuItem,
  | 'id'
  | 'name'
  | 'description'
  | 'priceVnd'
  | 'imageUrl'
  | 'isAvailable'
  | 'isBestSeller'
  | 'sortOrder'
>;

/** Một nhóm trong `GET /menu`, kèm các món */
export interface MenuSection {
  id: number;
  name: string;
  sortOrder: number;
  items: MenuEntryItem[];
}

/** Trường cho phép trong `?sort=` */
export const MENU_ITEM_SORT_FIELDS = ['sortOrder', 'name', 'priceVnd', 'createdAt'] as const;
