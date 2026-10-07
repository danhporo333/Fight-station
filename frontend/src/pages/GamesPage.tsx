import { useSearchParams } from 'react-router'

import { BRANCH_SEARCH_PARAM, BranchPicker } from '@/features/branch'
import { GAME_SEARCH_PARAMS, GameFilters, GameList, readIdParam } from '@/features/game'
import { SectionHeading } from '@/shared/components/ui/SectionHeading'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'

/**
 * Trang /games. Ghép branch + game qua URL: BranchPicker ghi `?branch=`, GameFilters ghi
 * `?category=` và `?q=`; trang đọc cả ba rồi truyền bộ lọc vào GameList.
 */
export function GamesPage() {
  useDocumentTitle('Game')
  const [searchParams] = useSearchParams()
  const query = {
    branchId: readIdParam(searchParams.get(BRANCH_SEARCH_PARAM)),
    categoryId: readIdParam(searchParams.get(GAME_SEARCH_PARAMS.category)),
    q: searchParams.get(GAME_SEARCH_PARAMS.q)?.trim() || undefined,
  }
  const filtered = query.branchId ?? query.categoryId ?? query.q

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
      <SectionHeading as="h1" tag="Game Library" title="Kho game" accent="Khủng bố">
        Các tựa game đang có tại quán. Chọn chi nhánh hoặc thể loại để xem nhanh.
      </SectionHeading>
      <div className="mb-6 flex justify-center">
        <BranchPicker />
      </div>
      <GameFilters />
      <GameList
        query={query}
        emptyMessage={filtered ? 'Không có game nào khớp bộ lọc.' : 'Chưa có game nào.'}
      />
    </section>
  )
}
