const vndFormatter = new Intl.NumberFormat('vi-VN')

/** Tiền từ API là số nguyên đơn vị đồng: 15000 → "15.000đ" */
export function formatVnd(amount: number): string {
  return `${vndFormatter.format(amount)}đ`
}

const VN_TIME_ZONE = 'Asia/Ho_Chi_Minh'

/**
 * API trả ISO 8601 UTC (`2026-10-05T15:30:00.000Z`) hoặc ngày `YYYY-MM-DD`; hiển thị theo giờ Việt Nam.
 * Mặc định: "05/10/2026". Truyền `options` để hiện thêm giờ.
 */
export function formatDate(value: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: VN_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...options,
  }).format(date)
}
