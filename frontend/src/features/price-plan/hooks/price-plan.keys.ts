import type { PricePlanQuery } from '../types/price-plan.types'

// Query key của feature price-plan, gom một chỗ để invalidate đúng key
export const pricePlanKeys = {
  list: ['price-plans'] as const,
  listWith: (query: PricePlanQuery) => [...pricePlanKeys.list, query] as const,
  branchOptions: ['price-plan-branch-options'] as const,
  details: ['price-plan'] as const,
  detail: (id: number, includeInactive: boolean) =>
    [...pricePlanKeys.details, id, { includeInactive }] as const,
}
