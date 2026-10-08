import type { PricePlanCombo } from '../utils/price-plan.utils'

interface PricePlanComboRowProps {
  combo: PricePlanCombo
}

/** Một dòng combo kiểu tờ giá: "Combo sáng (8h30–13h) ······ 199K" */
export function PricePlanComboRow({ combo }: PricePlanComboRowProps) {
  return (
    <li className="flex items-baseline gap-2 py-1.5 text-sm">
      <span className="min-w-0 font-semibold">{combo.label}</span>
      {/* Đường chấm nối tên combo với giá, như tờ giá in */}
      <span
        aria-hidden="true"
        className="min-w-4 flex-1 -translate-y-1 border-b border-dotted border-brand-500/35"
      />
      <span className="shrink-0 font-mono font-bold text-neon-gold [text-shadow:0_0_10px_rgb(255_196_0/0.4)]">
        <span className="sr-only">Giá </span>
        {combo.price}
      </span>
    </li>
  )
}
