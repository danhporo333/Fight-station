import { useMutation } from '@tanstack/react-query'

import { updateMenuCategory } from '../services/menu-category.service'
import type { MenuCategoryPayload } from '../types/menu.types'
import { useInvalidateMenu } from './useInvalidateMenu'

export function useUpdateMenuCategory() {
  const invalidate = useInvalidateMenu()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<MenuCategoryPayload> }) =>
      updateMenuCategory(id, payload),
    onSuccess: invalidate,
  })
}
