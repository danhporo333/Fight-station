import { describe, expect, it } from 'vitest'

import { formatDate, formatVnd } from './format'

describe('formatVnd', () => {
  it('thêm dấu chấm hàng nghìn và đuôi đ', () => {
    expect(formatVnd(15000)).toBe('15.000đ')
    expect(formatVnd(0)).toBe('0đ')
    expect(formatVnd(1250000)).toBe('1.250.000đ')
  })
})

describe('formatDate', () => {
  it('đổi giờ UTC sang ngày Việt Nam', () => {
    // 20:00 UTC ngày 05 = 03:00 sáng ngày 06 ở Việt Nam
    expect(formatDate('2026-10-05T20:00:00.000Z')).toBe('06/10/2026')
  })

  it('trả chuỗi rỗng khi giá trị không hợp lệ', () => {
    expect(formatDate('khong-phai-ngay')).toBe('')
  })
})
