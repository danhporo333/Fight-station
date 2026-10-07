import { http } from '@/shared/services/api'

import type { MenuCategory, MenuCategoryPayload, MenuCategoryQuery } from '../types/menu.types'

export const getMenuCategories = (params: MenuCategoryQuery) =>
  http.get<MenuCategory[]>('/menu-categories', { params })

export const createMenuCategory = (payload: MenuCategoryPayload) =>
  http.post<MenuCategory>('/menu-categories', payload)

export const updateMenuCategory = (id: number, payload: Partial<MenuCategoryPayload>) =>
  http.put<MenuCategory>(`/menu-categories/${id}`, payload)

export const deleteMenuCategory = (id: number) => http.delete(`/menu-categories/${id}`)
