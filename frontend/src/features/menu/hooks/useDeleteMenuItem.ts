import { useMutation } from '@tanstack/react-query'

import { deleteMenuItem } from '../services/menu.service'
import { useInvalidateMenu } from './useInvalidateMenu'

export function useDeleteMenuItem() {
  const invalidate = useInvalidateMenu()
  return useMutation({ mutationFn: deleteMenuItem, onSuccess: invalidate })
}
