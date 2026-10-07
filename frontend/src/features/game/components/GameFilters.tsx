import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'

import { useDebounce } from '@/shared/hooks/useDebounce'

import { useGameCategories } from '../hooks/useGameCategories'
import { GAME_SEARCH_PARAMS } from '../utils/game.utils'

const PILL_CLASS =
  'border px-5 py-2 text-sm font-semibold tracking-[0.1em] uppercase transition hover:border-brand-500 hover:bg-brand-500 hover:text-void'
const ACTIVE_CLASS = 'border-brand-500 bg-brand-500 text-void shadow-[0_0_15px_rgb(255_106_0/0.4)]'
const IDLE_CLASS = 'border-brand-500/30 text-muted'

/**
 * Bộ lọc game trên URL: nút thể loại (`?category=<id>`) và ô tìm tên (`?q=`, chờ 300ms sau lần gõ cuối).
 * Trang ghép đọc URL rồi truyền bộ lọc vào GameList.
 */
export function GameFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: categories } = useGameCategories()
  const selected = searchParams.get(GAME_SEARCH_PARAMS.category)
  const [text, setText] = useState(searchParams.get(GAME_SEARCH_PARAMS.q) ?? '')
  const debounced = useDebounce(text.trim())

  const setParam = (name: string, value: string | null) =>
    setSearchParams(
      (params) => {
        if (value) params.set(name, value)
        else params.delete(name)
        // Đổi bộ lọc thì về trang 1
        params.delete(GAME_SEARCH_PARAMS.page)
        return params
      },
      { replace: true },
    )

  // Đồng bộ ô tìm kiếm (đã debounce) lên URL
  useEffect(() => {
    if ((searchParams.get(GAME_SEARCH_PARAMS.q) ?? '') !== debounced) {
      setParam(GAME_SEARCH_PARAMS.q, debounced || null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ chạy khi chữ đã debounce đổi
  }, [debounced])

  const options = [{ id: null, name: 'Tất cả' }, ...(categories ?? [])]

  return (
    <div className="mb-10 flex flex-col items-center gap-6">
      <div
        role="group"
        aria-label="Lọc theo thể loại"
        className="flex flex-wrap justify-center gap-3"
      >
        {options.map((option) => {
          const active = option.id === null ? selected === null : selected === String(option.id)
          return (
            <button
              key={option.id ?? 'all'}
              type="button"
              aria-pressed={active}
              onClick={() =>
                setParam(GAME_SEARCH_PARAMS.category, option.id === null ? null : String(option.id))
              }
              className={`${PILL_CLASS} ${active ? ACTIVE_CLASS : IDLE_CLASS}`}
            >
              {option.name}
            </button>
          )
        })}
      </div>

      <label className="relative w-full max-w-md">
        <span className="sr-only">Tìm game theo tên</span>
        <Search
          aria-hidden="true"
          className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
        />
        <input
          type="search"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Tìm game theo tên…"
          className="w-full border border-brand-500/30 bg-card py-2.5 pr-3 pl-9 text-ink placeholder:text-muted focus:border-brand-500 focus:outline-none"
        />
      </label>
    </div>
  )
}
