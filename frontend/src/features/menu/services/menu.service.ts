import { http } from '@/shared/services/api'

import type { MenuItem, MenuItemPayload, MenuItemQuery, MenuSection } from '../types/menu.types'

/** Toàn bộ menu cho trang khách (nhóm kèm món, một request) */
export const getMenu = () => http.get<MenuSection[]>('/menu')

export const getMenuItems = (params: MenuItemQuery) =>
  http.get<MenuItem[]>('/menu-items', { params })

export const getMenuItem = (id: number, includeInactive = false) =>
  http.get<MenuItem>(`/menu-items/${id}`, {
    params: includeInactive ? { includeInactive } : undefined,
  })

export const createMenuItem = (payload: MenuItemPayload) =>
  http.post<MenuItem>('/menu-items', payload)

export const updateMenuItem = (id: number, payload: Partial<MenuItemPayload>) =>
  http.put<MenuItem>(`/menu-items/${id}`, payload)

export const deleteMenuItem = (id: number) => http.delete(`/menu-items/${id}`)
