import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { getMenuItems } from '../services/menu.service'
import type { MenuItemQuery } from '../types/menu.types'
import { menuKeys } from './menu.keys'

/** Danh sách món (trang quản trị truyền `includeInactive: true`); mặc định tối đa 100 món */
export function useMenuItems(query: MenuItemQuery = {}) {
  const params = { limit: 100, ...query }
  return useQuery({
    queryKey: menuKeys.itemList(params),
    queryFn: async () => (await getMenuItems(params)).data,
    // Đổi từ khóa / nhóm: giữ bảng cũ trên màn hình trong lúc tải, không nháy về khung xám
    placeholderData: keepPreviousData,
  })
}
