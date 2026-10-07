import { useQuery } from '@tanstack/react-query'

import { getMenuCategories } from '../services/menu-category.service'
import type { MenuCategoryQuery } from '../types/menu.types'
import { menuKeys } from './menu.keys'

/** Nhóm menu (ô chọn nhóm trong form và bộ lọc quản trị, trang quản trị nhóm) */
export function useMenuCategories(query: MenuCategoryQuery = {}) {
  const params = { limit: 100, ...query }
  return useQuery({
    queryKey: menuKeys.categoryList(params),
    queryFn: async () => (await getMenuCategories(params)).data,
  })
}
