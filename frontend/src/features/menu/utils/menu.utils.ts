import type { MenuCategoryFormInput, MenuItemFormInput } from '../types/menu.schema'
import type {
  MenuCategory,
  MenuCategoryPayload,
  MenuItem,
  MenuItemPayload,
} from '../types/menu.types'

/** Tham số URL của bộ lọc ở trang quản trị món */
export const MENU_SEARCH_PARAMS = { category: 'category', q: 'q' } as const

/** Đọc số nguyên dương từ tham số URL; sai hoặc trống → undefined */
export function readIdParam(value: string | null): number | undefined {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : undefined
}

/** `defaultCategoryId`: trang thêm món mở từ bộ lọc nhóm thì chọn sẵn nhóm đó */
export function emptyMenuItemForm(defaultCategoryId = ''): MenuItemFormInput {
  return {
    menuCategoryId: defaultCategoryId,
    name: '',
    description: '',
    priceVnd: '',
    imageUrl: '',
    isAvailable: true,
    isBestSeller: false,
    sortOrder: '0',
    isActive: true,
  }
}

/** Món từ API → giá trị form (null → '', số → chuỗi) */
export function toMenuItemFormValues(item: MenuItem): MenuItemFormInput {
  return {
    menuCategoryId: String(item.category.id),
    name: item.name,
    description: item.description ?? '',
    priceVnd: String(item.priceVnd),
    imageUrl: item.imageUrl ?? '',
    isAvailable: item.isAvailable,
    isBestSeller: item.isBestSeller,
    sortOrder: String(item.sortOrder),
    isActive: item.isActive,
  }
}

const emptyToNull = (value: string): string | null => (value === '' ? null : value)

/** Giá trị form → body POST/PUT (ô trống → null, chuỗi số → số) */
export function toMenuItemPayload(values: MenuItemFormInput): MenuItemPayload {
  return {
    menuCategoryId: Number(values.menuCategoryId),
    name: values.name,
    description: emptyToNull(values.description),
    priceVnd: Number(values.priceVnd),
    imageUrl: emptyToNull(values.imageUrl),
    isAvailable: values.isAvailable,
    isBestSeller: values.isBestSeller,
    sortOrder: Number(values.sortOrder),
    isActive: values.isActive,
  }
}

export const EMPTY_MENU_CATEGORY_FORM: MenuCategoryFormInput = {
  name: '',
  sortOrder: '0',
  isActive: true,
}

export function toMenuCategoryFormValues(category: MenuCategory): MenuCategoryFormInput {
  return {
    name: category.name,
    sortOrder: String(category.sortOrder),
    isActive: category.isActive,
  }
}

export function toMenuCategoryPayload(values: MenuCategoryFormInput): MenuCategoryPayload {
  return { name: values.name, sortOrder: Number(values.sortOrder), isActive: values.isActive }
}
