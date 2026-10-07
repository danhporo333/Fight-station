import type { UseFormSetError } from 'react-hook-form'

import { isApiError } from '@/shared/services/api'
import { applyServerErrors } from '@/shared/utils/form-errors'

import {
  MENU_CATEGORY_FORM_FIELDS,
  MENU_ITEM_FORM_FIELDS,
  type MenuCategoryFormInput,
  type MenuItemFormInput,
} from '../types/menu.schema'

/**
 * Gán lỗi API vào form món: trùng tên trong nhóm (MENU_003) vào ô `name`; nhóm vừa bị xóa (MENU_002)
 * vào ô chọn nhóm; lỗi validate theo `details`; còn lại vào khung lỗi đầu form.
 */
export function applyMenuItemErrors(
  error: unknown,
  setError: UseFormSetError<MenuItemFormInput>,
): void {
  if (isApiError(error) && error.code === 'MENU_003') {
    setError('name', { type: 'server', message: 'Nhóm này đã có món cùng tên' })
    return
  }
  if (isApiError(error) && error.code === 'MENU_002') {
    setError('menuCategoryId', {
      type: 'server',
      message: 'Nhóm này vừa bị xóa, hãy tải lại trang và chọn lại',
    })
    return
  }
  applyServerErrors(error, setError, MENU_ITEM_FORM_FIELDS)
}

/** Form nhóm: trùng tên (MENU_003) vào ô `name`; còn lại theo `details` hoặc khung lỗi */
export function applyMenuCategoryErrors(
  error: unknown,
  setError: UseFormSetError<MenuCategoryFormInput>,
): void {
  if (isApiError(error) && error.code === 'MENU_003') {
    setError('name', { type: 'server', message: 'Tên nhóm đã tồn tại' })
    return
  }
  applyServerErrors(error, setError, MENU_CATEGORY_FORM_FIELDS)
}
