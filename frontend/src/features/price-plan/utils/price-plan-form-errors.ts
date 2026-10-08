import type { UseFormSetError } from 'react-hook-form'

import { isApiError } from '@/shared/services/api'
import { getErrorMessage } from '@/shared/utils/error-messages'

import { PRICE_PLAN_FORM_FIELDS, type PricePlanFormInput } from '../types/price-plan.schema'

/** `details.field` của một quyền lợi sai, vd "features.1" */
const FEATURE_FIELD = /^features\.(\d+)$/

/**
 * Gán lỗi API vào form gói giá: `details` của COMMON_001 vào đúng ô (quyền lợi thứ N vào ô thứ N);
 * chi nhánh không còn (PRICE_002) vào mục chọn chi nhánh; gói vừa bị xóa (PRICE_001) và các lỗi khác vào
 * khung lỗi đầu form.
 */
export function applyPricePlanErrors(
  error: unknown,
  setError: UseFormSetError<PricePlanFormInput>,
): void {
  if (isApiError(error) && error.code === 'PRICE_002') {
    setError('branchIds', {
      type: 'server',
      message: 'Có chi nhánh vừa bị xóa, hãy tải lại trang và chọn lại',
    })
    return
  }
  let assigned = false
  if (isApiError(error)) {
    for (const detail of error.details ?? []) {
      const featureIndex = FEATURE_FIELD.exec(detail.field)?.[1]
      const field = PRICE_PLAN_FORM_FIELDS.find((name) => name === detail.field)
      if (featureIndex !== undefined) {
        setError(`features.${Number(featureIndex)}.content`, {
          type: 'server',
          message: detail.message,
        })
        assigned = true
      } else if (field) {
        setError(field, { type: 'server', message: detail.message })
        assigned = true
      }
    }
  }
  if (!assigned) setError('root.server', { type: 'server', message: getErrorMessage(error) })
}
