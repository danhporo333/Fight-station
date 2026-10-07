import { useEffect, useState } from 'react'

/** Trả về `value` sau khi ngừng thay đổi `delay` ms (ô tìm kiếm: 300ms rồi mới ghi vào URL) */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
