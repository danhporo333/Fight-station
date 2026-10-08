import { Button } from '@/shared/components/ui/Button'
import { getErrorMessage } from '@/shared/utils/error-messages'

import { usePricePlans } from '../hooks/usePricePlans'
import { PRICE_PLAN_GRID_CLASS } from '../utils/price-plan.utils'
import { PricePlanCard } from './PricePlanCard'
import { PricePlanListSkeleton } from './PricePlanListSkeleton'
import { PricePlanNotes } from './PricePlanNotes'

export interface PricePlanListProps {
  /** Cấp tiêu đề của tên gói: h2 trên /pricing (đã có h1), h3 trong mục h2 của trang chủ */
  headingLevel?: 'h2' | 'h3'
  /** Chỉ hiện gói áp dụng ở chi nhánh này (gói riêng của chi nhánh và gói chung) */
  branchId?: number
  /** Thông báo khi không có gói nào (trang ghép đổi theo bộ lọc) */
  emptyMessage?: string
}

/** Bảng giá trang khách: các gói đang hiện, cả bảng tải một lần (limit 100, không phân trang) */
export function PricePlanList({
  headingLevel = 'h3',
  branchId,
  emptyMessage = 'Bảng giá đang được cập nhật.',
}: PricePlanListProps) {
  const { data: plans, isPending, error, refetch } = usePricePlans({ branchId })

  if (isPending) return <PricePlanListSkeleton />

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

  if (plans.length === 0) {
    return <p className="text-center text-muted">{emptyMessage}</p>
  }

  return (
    <>
      <ul className={PRICE_PLAN_GRID_CLASS}>
        {plans.map((plan) => (
          <PricePlanCard key={plan.id} plan={plan} headingLevel={headingLevel} />
        ))}
      </ul>
      <PricePlanNotes />
    </>
  )
}
