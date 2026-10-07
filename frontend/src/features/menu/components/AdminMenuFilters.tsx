import { Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'

import { useDebounce } from '@/shared/hooks/useDebounce'

import { useMenuCategories } from '../hooks/useMenuCategories'
import { MENU_SEARCH_PARAMS } from '../utils/menu.utils'

const CONTROL_CLASS =
  'rounded-lg border border-neutral-700 bg-neutral-900 py-2 text-sm text-neutral-100 focus:border-brand-500 focus:outline-none'

/**
 * Bộ lọc bảng món ở trang quản trị, ghi lên URL (`replace`): ô tìm tên (`?q=`, chờ 300ms) và ô chọn
 * nhóm (`?category=<id>`, gồm cả nhóm đang ẩn). Trang đọc URL rồi truyền vào useMenuItems.
 */
export function AdminMenuFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: categories } = useMenuCategories({ includeInactive: true })
  const [text, setText] = useState(searchParams.get(MENU_SEARCH_PARAMS.q) ?? '')
  const debounced = useDebounce(text.trim())

  const setParam = (name: string, value: string) =>
    setSearchParams(
      (params) => {
        if (value) params.set(name, value)
        else params.delete(name)
        return params
      },
      { replace: true },
    )

  useEffect(() => {
    if ((searchParams.get(MENU_SEARCH_PARAMS.q) ?? '') !== debounced) {
      setParam(MENU_SEARCH_PARAMS.q, debounced)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ chạy khi chữ đã debounce đổi
  }, [debounced])

  return (
    <div className="flex flex-wrap gap-3">
      <label className="relative block w-full max-w-sm">
        <span className="sr-only">Tìm món theo tên</span>
        <Search
          aria-hidden="true"
          className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-500"
        />
        <input
          type="search"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Tìm món theo tên…"
          className={`${CONTROL_CLASS} w-full pr-9 pl-9 placeholder:text-neutral-500`}
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

      <label className="flex items-center gap-2 text-sm text-neutral-300">
        Nhóm
        <select
          value={searchParams.get(MENU_SEARCH_PARAMS.category) ?? ''}
          onChange={(event) => setParam(MENU_SEARCH_PARAMS.category, event.target.value)}
          className={`${CONTROL_CLASS} px-3`}
        >
          <option value="">Tất cả nhóm</option>
          {categories?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
              {category.isActive ? '' : ' (đang ẩn)'}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
