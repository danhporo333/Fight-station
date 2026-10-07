import { http } from '@/shared/services/api'

import type { Shop, UpdateShopPayload } from '../types/shop.types'

export const getShop = () => http.get<Shop>('/shop')

export const updateShop = (payload: UpdateShopPayload) => http.put<Shop>('/shop', payload)
