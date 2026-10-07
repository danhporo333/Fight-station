import { useRef } from 'react'
import { useSearchParams } from 'react-router'

import { BRANCH_SEARCH_PARAM, BranchPicker } from '@/features/branch'
import {
  GAME_SEARCH_PARAMS,
  GAMES_PER_PAGE,
  GameFilters,
  GameList,
  readIdParam,
} from '@/features/game'
import { SectionHeading } from '@/shared/components/ui/SectionHeading'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'

/**
 * Trang /games. Ghép branch + game qua URL: BranchPicker ghi `?branch=`, GameFilters ghi
 * `?category=` và `?q=` (đổi bộ lọc thì về trang 1), thanh chuyển trang ghi `?page=`;
 * trang đọc cả bốn rồi truyền vào GameList. Mỗi trang GAMES_PER_PAGE game.
 */
export function GamesPage() {
  useDocumentTitle('Game')
  const [searchParams, setSearchParams] = useSearchParams()
  const listTopRef = useRef<HTMLDivElement>(null)
  const query = {
    branchId: readIdParam(searchParams.get(BRANCH_SEARCH_PARAM)),
    categoryId: readIdParam(searchParams.get(GAME_SEARCH_PARAMS.category)),
    q: searchParams.get(GAME_SEARCH_PARAMS.q)?.trim() || undefined,
    page: readIdParam(searchParams.get(GAME_SEARCH_PARAMS.page)) ?? 1,
    limit: GAMES_PER_PAGE,
  }
  const filtered = query.branchId ?? query.categoryId ?? query.q

  // Đổi trang: ghi URL (không replace, để nút "Quay lại" về trang trước) rồi cuộn lên đầu danh sách
  const goToPage = (page: number) => {
    setSearchParams((params) => {
      if (page > 1) params.set(GAME_SEARCH_PARAMS.page, String(page))
      else params.delete(GAME_SEARCH_PARAMS.page)
      return params
    })
    listTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
      <SectionHeading as="h1" tag="Game Library" title="Kho game" accent="Khủng bố">
        Các tựa game đang có tại quán. Chọn chi nhánh hoặc thể loại để xem nhanh.
      </SectionHeading>
      {/* scroll-mt: chừa chỗ cho header dính khi cuộn tới */}
      <div ref={listTopRef} className="scroll-mt-20">
        <div className="mb-6 flex justify-center">
          <BranchPicker />
        </div>
        <GameFilters />
        <GameList
          query={query}
          onPageChange={goToPage}
          emptyMessage={
            query.page > 1
              ? 'Không có game nào ở trang này.'
              : filtered
                ? 'Không có game nào khớp bộ lọc.'
                : 'Chưa có game nào.'
          }
        />
      </div>
    </section>
  )
}
