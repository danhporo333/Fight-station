import type { UseFormSetError } from 'react-hook-form'

import { isApiError } from '@/shared/services/api'
import { applyServerErrors } from '@/shared/utils/form-errors'

import { GAME_FORM_FIELDS, type GameFormInput } from '../types/game.schema'

/**
 * Gán lỗi API vào form game: trùng tên (GAME_002) vào ô `title`; thể loại không còn (GAME_003)
 * vào ô thể loại; lỗi validate theo `details`; còn lại (GAME_006 chi nhánh không có...) vào khung lỗi.
 */
export function applyGameErrors(error: unknown, setError: UseFormSetError<GameFormInput>): void {
  if (isApiError(error) && error.code === 'GAME_002') {
    setError('title', { type: 'server', message: 'Tên game đã tồn tại' })
    return
  }
  if (isApiError(error) && error.code === 'GAME_003') {
    setError('gameCategoryIds', {
      type: 'server',
      message: 'Có thể loại vừa bị xóa, hãy tải lại trang và chọn lại',
    })
    return
  }
  applyServerErrors(error, setError, GAME_FORM_FIELDS)
}
