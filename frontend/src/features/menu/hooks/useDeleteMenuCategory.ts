import { useMutation } from '@tanstack/react-query'

import { deleteMenuCategory } from '../services/menu-category.service'
import { useInvalidateMenu } from './useInvalidateMenu'

/** Nhóm còn món → API trả 409 MENU_004 (giao diện đã khóa nút xóa trước) */
export function useDeleteMenuCategory() {
  const invalidate = useInvalidateMenu()
  return useMutation({ mutationFn: deleteMenuCategory, onSuccess: invalidate })
}
