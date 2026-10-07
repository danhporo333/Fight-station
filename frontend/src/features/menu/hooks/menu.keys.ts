import type { MenuCategoryQuery, MenuItemQuery } from '../types/menu.types'

// Query key của feature menu, gom một chỗ để invalidate đúng key
export const menuKeys = {
  /** GET /menu (trang khách) */
  board: ['menu'] as const,
  items: ['menu-items'] as const,
  itemList: (query: MenuItemQuery) => [...menuKeys.items, query] as const,
  itemDetails: ['menu-item'] as const,
  itemDetail: (id: number, includeInactive: boolean) =>
    [...menuKeys.itemDetails, id, { includeInactive }] as const,
  categories: ['menu-categories'] as const,
  categoryList: (query: MenuCategoryQuery) => [...menuKeys.categories, query] as const,
}
