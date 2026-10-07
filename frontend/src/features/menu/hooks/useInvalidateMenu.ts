import { useQueryClient } from '@tanstack/react-query'

import { menuKeys } from './menu.keys'

/**
 * Sau mọi thao tác ghi (món hoặc nhóm): làm mới menu trang khách, danh sách món, chi tiết món và nhóm
 * (số món của nhóm, tên nhóm trên bảng món, nhóm ẩn/hiện ở trang khách đều có thể đổi).
 */
export function useInvalidateMenu() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: menuKeys.board }),
      queryClient.invalidateQueries({ queryKey: menuKeys.items }),
      queryClient.invalidateQueries({ queryKey: menuKeys.itemDetails }),
      queryClient.invalidateQueries({ queryKey: menuKeys.categories }),
    ])
}
