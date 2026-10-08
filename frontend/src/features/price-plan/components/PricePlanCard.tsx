import { Check, MapPin } from 'lucide-react'

import { formatVndShort } from '@/shared/utils/format'

import type { PricePlan } from '../types/price-plan.types'
import { splitPricePlanLines } from '../utils/price-plan.utils'
import { PricePlanComboRow } from './PricePlanComboRow'

interface PricePlanCardProps {
  plan: PricePlan
  /** Cấp tiêu đề của tên gói: h2 khi trang có h1 ngay trên (/pricing), h3 khi nằm trong mục h2 (trang chủ) */
  headingLevel: 'h2' | 'h3'
  /** Class thêm cho thẻ (dải trượt đặt chiều rộng và khoảng cách ở đây) */
  className?: string
}

/**
 * Thẻ một loại phòng: tên, giá giờ lẻ nổi bật, bảng combo (dòng "Tên: 199K"), rồi dịch vụ trong phòng
 * (các dòng còn lại). Gói HOT có viền sáng và nhãn.
 */
export function PricePlanCard({ plan, headingLevel: Heading, className = '' }: PricePlanCardProps) {
  const { combos, perks } = splitPricePlanLines(plan.features)

  return (
    <li
      className={`relative flex flex-col border bg-card/80 p-6 transition hover:-translate-y-1 hover:border-brand-500 ${className} ${
        plan.isHot
          ? 'border-brand-500 shadow-[0_0_30px_rgb(255_106_0/0.25)]'
          : 'border-brand-500/25'
      }`}
    >
      {plan.isHot && (
        <span className="absolute -top-3 right-4 clip-skew bg-brand-500 px-3 py-0.5 font-mono text-xs font-bold tracking-widest text-void uppercase">
          Hot
        </span>
      )}

      <Heading className="inline-block self-start clip-skew bg-brand-500 px-5 py-1.5 text-sm font-bold tracking-[0.15em] text-void uppercase">
        {plan.name}
      </Heading>

      {plan.branches.length > 0 && (
        <p className="mt-3 flex items-center gap-1.5 font-mono text-xs tracking-wider text-muted uppercase">
          <MapPin aria-hidden="true" className="size-3.5 text-brand-500" />
          Chi nhánh {plan.branches.map((branch) => branch.name).join(', ')}
        </p>
      )}

      <div className="mt-5">
        {plan.description && (
          <p className="font-mono text-xs tracking-[0.2em] text-muted uppercase">
            {plan.description}
          </p>
        )}
        <p className="flex items-baseline gap-1">
          <span className="text-glow font-display text-5xl font-bold text-brand-500">
            {formatVndShort(plan.priceVnd)}
          </span>
          <span className="text-muted">{plan.unit}</span>
        </p>
      </div>

      {combos.length > 0 && (
        <ul className="mt-5 border-t border-brand-500/20 pt-3">
          {combos.map((combo) => (
            <PricePlanComboRow key={combo.label} combo={combo} />
          ))}
        </ul>
      )}

      {perks.length > 0 && (
        <div className="mt-5 border-t border-brand-500/20 pt-4">
          <p className="mb-3 font-mono text-xs tracking-[0.2em] text-neon-red uppercase">
            Trong phòng
          </p>
          <ul className="flex flex-col gap-2 text-sm">
            {perks.map((perk) => (
              <li key={perk} className="flex items-start gap-2">
                <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand-500" />
                <span>{perk}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  )
}
