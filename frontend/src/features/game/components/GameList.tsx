import { Button } from '@/shared/components/ui/Button'
import { Pagination } from '@/shared/components/ui/Pagination'
import { getErrorMessage } from '@/shared/utils/error-messages'

import { useGames } from '../hooks/useGames'
import type { GameListQuery } from '../types/game.types'
import { GameCard } from './GameCard'

const GRID_CLASS = 'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6'

export interface GameListProps {
  /** Bộ lọc và trang (trang ghép đọc từ URL rồi truyền vào) */
  query?: GameListQuery
  /** Dòng hiện khi không có game nào khớp bộ lọc */
  emptyMessage?: string
  /** Có truyền thì hiện thanh chuyển trang dưới lưới (khi nhiều hơn 1 trang) */
  onPageChange?: (page: number) => void
}

/** Lưới game đang hiện, đủ 3 trạng thái: đang tải, lỗi, rỗng; có thể kèm thanh chuyển trang */
export function GameList({
  query = {},
  emptyMessage = 'Chưa có game nào.',
  onPageChange,
}: GameListProps) {
  const { data, isPending, error, refetch } = useGames(query)

  if (isPending) {
    return (
      <div aria-hidden="true" className={GRID_CLASS}>
        {Array.from({ length: Math.min(query.limit ?? 8, 8) }, (_, index) => (
          <div
            key={index}
            className="aspect-[3/5] animate-pulse border border-brand-500/10 bg-card"
          />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <p role="alert" className="text-sm text-red-400">
          {getErrorMessage(error)}
        </p>
        <Button variant="secondary" onClick={() => void refetch()}>
          Thử lại
        </Button>
      </div>
    )
  }

  const { items, meta } = data
  const pagination = onPageChange && meta && (
    <Pagination page={meta.page} totalPages={meta.totalPages} onChange={onPageChange} />
  )

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6">
        <p className="text-center text-muted">{emptyMessage}</p>
        {/* Lỡ mở trang vượt quá số trang (vd ?page=99): vẫn hiện thanh để quay lại */}
        {meta && meta.page > 1 && pagination}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-10">
      <div className={GRID_CLASS}>
        {items.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
      {pagination}
    </div>
  )
}
