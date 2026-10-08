import { http } from '@/shared/services/api'

import type {
  BranchOption,
  PricePlan,
  PricePlanPayload,
  PricePlanQuery,
} from '../types/price-plan.types'

export const getPricePlans = (params: PricePlanQuery) =>
  http.get<PricePlan[]>('/price-plans', { params })

export const getPricePlan = (id: number, includeInactive = false) =>
  http.get<PricePlan>(`/price-plans/${id}`, {
    params: includeInactive ? { includeInactive } : undefined,
  })

export const createPricePlan = (payload: PricePlanPayload) =>
  http.post<PricePlan>('/price-plans', payload)

export const updatePricePlan = (id: number, payload: Partial<PricePlanPayload>) =>
  http.put<PricePlan>(`/price-plans/${id}`, payload)

export const deletePricePlan = (id: number) => http.delete(`/price-plans/${id}`)

/** Chi nhánh cho ô "Áp dụng cho" của form (kể cả chi nhánh đang ẩn) */
export const getBranchOptions = () =>
  http.get<BranchOption[]>('/branches', { params: { limit: 100, includeInactive: true } })
