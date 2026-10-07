import type { UseFormSetError } from 'react-hook-form'

import { isApiError } from '@/shared/services/api'
import { applyServerErrors } from '@/shared/utils/form-errors'

import { GAME_FORM_FIELDS, type GameFormInput } from '../types/game.schema'

/**
 * Gán lỗi API vào form game: trùng tên (GAME_002) vào ô `title`; lỗi validate theo `details`;
 * còn lại (GAME_003 thể loại không có, GAME_006 chi nhánh không có...) vào khung lỗi đầu form.
 */
export function applyGameErrors(error: unknown, setError: UseFormSetError<GameFormInput>): void {
  if (isApiError(error) && error.code === 'GAME_002') {
    setError('title', { type: 'server', message: 'Tên game đã tồn tại' })
    return
  }
  applyServerErrors(error, setError, GAME_FORM_FIELDS)
}
