import { useQuery } from '@tanstack/react-query'

import { getMenuItem } from '../services/menu.service'
import { menuKeys } from './menu.keys'

/** Một món. Form sửa dùng `includeInactive` để mở được cả món đang ẩn. */
export function useMenuItem(id: number, includeInactive = false) {
  return useQuery({
    queryKey: menuKeys.itemDetail(id, includeInactive),
    queryFn: async () => (await getMenuItem(id, includeInactive)).data,
    enabled: id > 0,
  })
}
