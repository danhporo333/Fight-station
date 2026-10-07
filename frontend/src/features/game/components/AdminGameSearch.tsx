import { Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'

import { useDebounce } from '@/shared/hooks/useDebounce'

import { GAME_SEARCH_PARAMS } from '../utils/game.utils'

/**
 * Ô tìm game theo tên ở trang quản trị. Ghi `?q=` lên URL sau khi ngừng gõ 300ms (tải lại trang vẫn
 * giữ từ khóa); trang đọc URL rồi truyền `q` vào useGames. Không phân biệt hoa thường và dấu (do API).
 */
export function AdminGameSearch() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [text, setText] = useState(searchParams.get(GAME_SEARCH_PARAMS.q) ?? '')
  const debounced = useDebounce(text.trim())

  useEffect(() => {
    if ((searchParams.get(GAME_SEARCH_PARAMS.q) ?? '') === debounced) return
    setSearchParams(
      (params) => {
        if (debounced) params.set(GAME_SEARCH_PARAMS.q, debounced)
        else params.delete(GAME_SEARCH_PARAMS.q)
        return params
      },
      { replace: true },
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ chạy khi chữ đã debounce đổi
  }, [debounced])

  return (
    <label className="relative block w-full max-w-sm">
      <span className="sr-only">Tìm game theo tên</span>
      <Search
        aria-hidden="true"
        className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-500"
      />
      <input
        type="search"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Tìm game theo tên…"
        className="w-full rounded-lg border border-neutral-700 bg-neutral-900 py-2 pr-9 pl-9 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-brand-500 focus:outline-none"
      />
      {text && (
        <button
          type="button"
          aria-label="Xóa từ khóa"
          onClick={() => setText('')}
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-neutral-500 hover:text-neutral-200"
        >
          <X className="size-4" />
        </button>
      )}
    </label>
  )
}
