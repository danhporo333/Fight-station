import { useMutation } from '@tanstack/react-query'

import { createMenuCategory } from '../services/menu-category.service'
import { useInvalidateMenu } from './useInvalidateMenu'

export function useCreateMenuCategory() {
  const invalidate = useInvalidateMenu()
  return useMutation({ mutationFn: createMenuCategory, onSuccess: invalidate })
}
