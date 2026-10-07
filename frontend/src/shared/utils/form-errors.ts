import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'

import { isApiError } from '@/shared/services/api'

import { getErrorMessage } from './error-messages'

/**
 * Gán lỗi từ API vào form React Hook Form:
 * - `details` (lỗi validate COMMON_001) → từng ô có tên trong `fields`
 * - còn lại → lỗi chung `root.server` (hiện ở đầu/cuối form)
 */
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
): void {
  let assigned = false
  if (isApiError(error)) {
    for (const detail of error.details ?? []) {
      const field = fields.find((name) => name === detail.field)
      if (field) {
        setError(field, { type: 'server', message: detail.message })
        assigned = true
      }
    }
  }
  if (!assigned) setError('root.server', { type: 'server', message: getErrorMessage(error) })
}
