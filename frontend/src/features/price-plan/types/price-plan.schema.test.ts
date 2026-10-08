import { describe, expect, it } from 'vitest'

import { EMPTY_PRICE_PLAN_FORM, toPricePlanPayload } from '../utils/price-plan.utils'
import { pricePlanFormSchema, type PricePlanFormInput } from './price-plan.schema'

const valid: PricePlanFormInput = {
  ...EMPTY_PRICE_PLAN_FORM,
  name: 'VIP Room',
  priceVnd: '69000',
}

describe('pricePlanFormSchema (chi nhánh áp dụng)', () => {
  it('cho qua khi áp dụng mọi chi nhánh', () => {
    expect(pricePlanFormSchema.safeParse(valid).success).toBe(true)
  })

  it('cho qua khi chọn từng chi nhánh và đã tick ít nhất một', () => {
    const values = { ...valid, allBranches: false, branchIds: ['1', '4'] }

    expect(pricePlanFormSchema.safeParse(values).success).toBe(true)
  })

  it('báo lỗi ở ô chi nhánh khi bỏ "mọi chi nhánh" mà không tick chi nhánh nào', () => {
    const result = pricePlanFormSchema.safeParse({ ...valid, allBranches: false, branchIds: [] })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.path).toEqual(['branchIds'])
  })
})

describe('toPricePlanPayload (chi nhánh áp dụng)', () => {
  it('"mọi chi nhánh" gửi branchIds: null', () => {
    expect(toPricePlanPayload(valid).branchIds).toBeNull()
  })

  it('chọn nhiều chi nhánh gửi mảng số, bỏ qua danh sách tick cũ khi chọn "mọi chi nhánh"', () => {
    const some = toPricePlanPayload({ ...valid, allBranches: false, branchIds: ['1', '4'] })
    const all = toPricePlanPayload({ ...valid, allBranches: true, branchIds: ['1', '4'] })

    expect(some.branchIds).toEqual([1, 4])
    expect(all.branchIds).toBeNull()
  })
})
