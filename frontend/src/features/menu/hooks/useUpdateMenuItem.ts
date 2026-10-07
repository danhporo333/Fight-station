import { useMutation } from '@tanstack/react-query'

import { updateMenuItem } from '../services/menu.service'
import type { MenuItemPayload } from '../types/menu.types'
import { useInvalidateMenu } from './useInvalidateMenu'

/** PUT cập nhật một phần; nút "Tạm hết" chỉ gửi `{ isAvailable }` */
export function useUpdateMenuItem() {
  const invalidate = useInvalidateMenu()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<MenuItemPayload> }) =>
      updateMenuItem(id, payload),
    onSuccess: invalidate,
  })
}
