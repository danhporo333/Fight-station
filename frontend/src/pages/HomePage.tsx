import { Play } from 'lucide-react'
import { Link } from 'react-router'

import { BranchList, useBranchSummary } from '@/features/branch'
import { ShopHero, useShop, type HeroStat } from '@/features/shop'
import { SectionHeading } from '@/shared/components/ui/SectionHeading'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'

const BUTTON_CLASS =
  'inline-flex items-center gap-2 px-8 py-4 font-display text-sm font-bold tracking-[0.15em] uppercase transition text-center'

/** Trang chủ: ghép các feature. Sau này thêm GameList, PricePlanList, MenuList... */
export function HomePage() {
  useDocumentTitle()
  const { data: shop } = useShop()
  const branchSummary = useBranchSummary()

  // TODO(game): thêm { value: <số game>, label: 'Tựa game' } lên đầu khi có feature game
  const heroStats: HeroStat[] = branchSummary
    ? [
        { value: String(branchSummary.ps5Total), label: 'Máy PS5' },
        { value: String(branchSummary.count), label: 'Chi nhánh' },
      ]
    : []

  return (
    <>
      <ShopHero
        stats={heroStats}
        actions={
          <>
            {/* TODO(game): /games hiện là trang 404, có trang khi làm feature game */}
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

      <section id="branches" className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <SectionHeading tag="Locations" title="Hệ thống" accent="Chi nhánh">
          Muốn ghé chi nhánh nào, cứ nhắn Facebook hoặc Zalo của chi nhánh đó để được tư vấn.
        </SectionHeading>
        <BranchList fallbackFacebookUrl={shop?.facebookUrl} />
      </section>
    </>
  )
}
