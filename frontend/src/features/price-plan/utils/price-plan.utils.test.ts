import { describe, expect, it } from 'vitest'

import type { PricePlanFeature } from '../types/price-plan.types'
import { splitPricePlanLines } from './price-plan.utils'

const line = (id: number, content: string): PricePlanFeature => ({ id, content, sortOrder: id })

describe('splitPricePlanLines', () => {
  it('tách combo (đuôi ": <số>K") khỏi dịch vụ trong phòng, giữ thứ tự', () => {
    const result = splitPricePlanLines([
      line(1, 'Combo sáng (8h30–13h): 199K'),
      line(2, 'Máy lạnh'),
      line(3, 'Combo 5H (tự chọn): 309k'),
    ])

    expect(result.combos).toEqual([
      { label: 'Combo sáng (8h30–13h)', price: '199K' },
      { label: 'Combo 5H (tự chọn)', price: '309K' },
    ])
    expect(result.perks).toEqual(['Máy lạnh'])
  })

  it('dòng có dấu hai chấm nhưng không có giá vẫn là dịch vụ', () => {
    const result = splitPricePlanLines([line(1, 'Tay cầm: DualSense')])

    expect(result.combos).toEqual([])
    expect(result.perks).toEqual(['Tay cầm: DualSense'])
  })

  it('danh sách rỗng trả hai mảng rỗng', () => {
    expect(splitPricePlanLines([])).toEqual({ combos: [], perks: [] })
  })
})
