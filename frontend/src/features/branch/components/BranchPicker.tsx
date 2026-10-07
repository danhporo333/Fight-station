import { useSearchParams } from 'react-router'

import { useBranches } from '../hooks/useBranches'
import { BRANCH_SEARCH_PARAM } from '../utils/branch.utils'

const PILL_CLASS =
  'border px-3 py-1.5 font-mono text-xs tracking-wider uppercase transition-colors hover:border-brand-500 hover:text-brand-500'
const ACTIVE_CLASS = 'border-brand-500 bg-brand-500/15 text-brand-500'
const IDLE_CLASS = 'border-brand-500/20 text-muted'

/**
 * Chọn chi nhánh để lọc (vd danh sách game). Ghi vào URL `?branch=<id>`, không lưu store;
 * "Tất cả" xóa tham số. Đang tải hoặc lỗi thì ẩn (bộ lọc không bắt buộc).
 */
export function BranchPicker() {
  const { data: branches } = useBranches()
  const [searchParams, setSearchParams] = useSearchParams()
  const selected = searchParams.get(BRANCH_SEARCH_PARAM)

  if (!branches || branches.length === 0) return null

  const select = (id: number | null) =>
    setSearchParams(
      (params) => {
        if (id === null) params.delete(BRANCH_SEARCH_PARAM)
        else params.set(BRANCH_SEARCH_PARAM, String(id))
        params.delete('page')
        return params
      },
      { replace: true },
    )

  const options = [{ id: null, name: 'Tất cả chi nhánh' }, ...branches]

  return (
    <div role="group" aria-label="Chọn chi nhánh" className="flex flex-wrap justify-center gap-2">
      {options.map((option) => {
        const active = option.id === null ? selected === null : selected === String(option.id)
        return (
          <button
            key={option.id ?? 'all'}
            type="button"
            aria-pressed={active}
            onClick={() => select(option.id)}
            className={`${PILL_CLASS} ${active ? ACTIVE_CLASS : IDLE_CLASS}`}
          >
            {option.name}
          </button>
        )
      })}
    </div>
  )
}
