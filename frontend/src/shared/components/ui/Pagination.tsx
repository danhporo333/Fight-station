import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface PaginationProps {
  /** Trang hiện tại, bắt đầu từ 1 */
  page: number
  totalPages: number
  onChange: (page: number) => void
}

const BOX =
  'flex size-10 items-center justify-center border text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-30'
const IDLE = 'border-brand-500/30 text-muted hover:border-brand-500 hover:text-brand-500'
const ACTIVE = 'border-brand-500 bg-brand-500 text-void shadow-[0_0_15px_rgb(255_106_0/0.4)]'

/**
 * Các số trang cần hiện: luôn có trang đầu, trang cuối và 1 trang mỗi bên trang hiện tại;
 * chỗ bị lược bỏ thành "…". Vd trang 5/10 → 1 … 4 5 6 … 10.
 */
function pageItems(page: number, totalPages: number): (number | '…')[] {
  const pages = new Set([1, totalPages, page - 1, page, page + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b)
  return sorted.flatMap((p, index) => (index > 0 && p - sorted[index - 1]! > 1 ? ['…', p] : [p]))
}

/** Thanh chuyển trang kiểu neon: mũi tên trước/sau và số trang. Chỉ 1 trang thì không hiện. */
export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <nav aria-label="Chuyển trang" className="flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        aria-label="Trang trước"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className={`${BOX} ${IDLE}`}
      >
        <ChevronLeft aria-hidden="true" className="size-5" />
      </button>

      {pageItems(page, totalPages).map((item, index) =>
        item === '…' ? (
          <span key={`gap-${index}`} aria-hidden="true" className="px-1 text-muted">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            aria-label={`Trang ${item}`}
            aria-current={item === page ? 'page' : undefined}
            onClick={() => onChange(item)}
            className={`${BOX} font-display ${item === page ? ACTIVE : IDLE}`}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        aria-label="Trang sau"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className={`${BOX} ${IDLE}`}
      >
        <ChevronRight aria-hidden="true" className="size-5" />
      </button>
    </nav>
  )
}
