import { Play } from 'lucide-react'
import { Link } from 'react-router'

import { BranchList, useBranchSummary } from '@/features/branch'
import { GameList, useGameCount } from '@/features/game'
import { ShopHero, useShop, type HeroStat } from '@/features/shop'
import { SectionHeading } from '@/shared/components/ui/SectionHeading'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'

const BUTTON_CLASS =
  'inline-flex items-center gap-2 px-8 py-4 font-display text-sm font-bold tracking-[0.15em] uppercase transition text-center'

/** Game hiện ở trang chủ; xem hết ở /games */
const HOME_GAME_LIMIT = 8

/** Trang chủ: ghép các feature. Sau này thêm PricePlanList, MenuList... */
export function HomePage() {
  useDocumentTitle()
  const { data: shop } = useShop()
  const branchSummary = useBranchSummary()
  const gameCount = useGameCount()

  // Giá trị rỗng hoặc "0" thì ShopHero tự ẩn
  const heroStats: HeroStat[] = [
    { value: gameCount === undefined ? '' : String(gameCount), label: 'Tựa game' },
    ...(branchSummary
      ? [
          { value: String(branchSummary.ps5Total), label: 'Máy PS5' },
          { value: String(branchSummary.count), label: 'Chi nhánh' },
        ]
      : []),
  ]

  return (
    <>
      <ShopHero
        stats={heroStats}
        actions={
          <>
            <Link
              to="/games"
              className={`${BUTTON_CLASS} clip-skew-lg bg-linear-135 from-brand-500 to-neon-amber text-void hover:-translate-y-1 hover:shadow-[0_10px_30px_rgb(255_106_0/0.4)]`}
            >
              <Play aria-hidden="true" className="size-4 fill-current" />
              Xem game
            </Link>
            <Link
              to="/branches"
              className={`${BUTTON_CLASS} border-2 border-brand-500 text-brand-500 hover:bg-brand-500/10 hover:shadow-[0_0_20px_rgb(255_106_0/0.5)]`}
            >
              Tìm chi nhánh
            </Link>
          </>
        }
      />

      <section id="games" className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <SectionHeading tag="Game Library" title="Kho game" accent="Khủng bố">
          Các tựa game đang có tại quán.
        </SectionHeading>
        <GameList query={{ limit: HOME_GAME_LIMIT }} />
        <div className="mt-10 flex justify-center">
          <Link
            to="/games"
            className={`${BUTTON_CLASS} border-2 border-brand-500 text-brand-500 hover:bg-brand-500/10`}
          >
            Xem tất cả game
          </Link>
        </div>
      </section>

      <section id="branches" className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <SectionHeading tag="Locations" title="Hệ thống" accent="Chi nhánh">
          Muốn ghé chi nhánh nào, cứ nhắn Facebook hoặc Zalo của chi nhánh đó để được tư vấn.
        </SectionHeading>
        <BranchList fallbackFacebookUrl={shop?.facebookUrl} />
      </section>
    </>
  )
}
