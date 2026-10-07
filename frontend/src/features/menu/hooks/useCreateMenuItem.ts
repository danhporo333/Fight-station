import { useMutation } from '@tanstack/react-query'

import { createMenuItem } from '../services/menu.service'
import { useInvalidateMenu } from './useInvalidateMenu'

export function useCreateMenuItem() {
  const invalidate = useInvalidateMenu()
  return useMutation({ mutationFn: createMenuItem, onSuccess: invalidate })
}
