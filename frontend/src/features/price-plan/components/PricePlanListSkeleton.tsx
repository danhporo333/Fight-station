import { PRICE_PLAN_GRID_CLASS } from '../utils/price-plan.utils'

/** Khung chờ khi đang tải bảng giá */
export function PricePlanListSkeleton() {
  return (
    <div aria-hidden="true" className={PRICE_PLAN_GRID_CLASS}>
      {[1, 2, 3].map((key) => (
        <div key={key} className="h-96 animate-pulse border border-brand-500/20 bg-card/80" />
      ))}
    </div>
  )
}
