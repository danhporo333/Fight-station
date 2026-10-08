import { Link } from 'react-router'

import { Button } from '@/shared/components/ui/Button'
import { formatVnd } from '@/shared/utils/format'

import type { PricePlan } from '../types/price-plan.types'

interface PricePlanTableProps {
  plans: PricePlan[]
  /** Id gói đang đổi ẩn/hiện (khóa nút của dòng đó) */
  togglingId: number | null
  onToggleActive: (plan: PricePlan) => void
  onDelete: (plan: PricePlan) => void
}

const TH = 'px-4 py-3 font-medium'

/** Bảng gói giá ở trang quản trị (gồm cả gói đang ẩn), có nút đổi nhanh ẩn/hiện */
export function PricePlanTable({
  plans,
  togglingId,
  onToggleActive,
  onDelete,
}: PricePlanTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-800">
      <table className="w-full text-left text-sm">
        <thead className="bg-neutral-900 text-neutral-400">
          <tr>
            <th scope="col" className={TH}>
              Gói
            </th>
            <th scope="col" className={TH}>
              Chi nhánh
            </th>
            <th scope="col" className={`${TH} text-right`}>
              Giá
            </th>
            <th scope="col" className={`${TH} text-right`}>
              Combo / dịch vụ
            </th>
            <th scope="col" className={TH}>
              Trạng thái
            </th>
            <th scope="col" className="px-4 py-3">
              <span className="sr-only">Thao tác</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800">
          {plans.map((plan) => (
            <tr key={plan.id} className={plan.isActive ? '' : 'text-neutral-500'}>
              <td className="px-4 py-3">
                <p className="flex flex-wrap items-center gap-2 font-semibold text-neutral-100">
                  {plan.name}
                  {plan.isHot && (
                    <span className="rounded bg-brand-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      HOT
                    </span>
                  )}
                </p>
                {plan.description && <p className="text-xs text-neutral-500">{plan.description}</p>}
              </td>
              <td className="px-4 py-3">
                {plan.branches.length > 0
                  ? plan.branches.map((branch) => branch.name).join(', ')
                  : 'Mọi chi nhánh'}
              </td>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                {formatVnd(plan.priceVnd)}
                {plan.unit}
              </td>
              <td className="px-4 py-3 text-right">{plan.features.length}</td>
              <td className="px-4 py-3">
                {/* Nút riêng (không dùng Button) để màu chữ theo trạng thái không bị màu của variant đè */}
                <button
                  type="button"
                  disabled={togglingId === plan.id}
                  aria-busy={togglingId === plan.id}
                  aria-label={`${plan.name}: ${plan.isActive ? 'đang hiện, bấm để ẩn' : 'đang ẩn, bấm để hiện'}`}
                  onClick={() => onToggleActive(plan)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold whitespace-nowrap transition hover:bg-neutral-800 disabled:cursor-wait disabled:opacity-60 ${
                    plan.isActive
                      ? 'border-green-500/40 text-green-400'
                      : 'border-neutral-600 text-neutral-400'
                  }`}
                >
                  <span aria-hidden="true" className="size-2 rounded-full bg-current" />
                  {plan.isActive ? 'Đang hiện' : 'Đang ẩn'}
                </button>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Link
                    to={`/admin/price-plans/${plan.id}/edit`}
                    className="rounded-lg px-3 py-1.5 font-semibold text-brand-400 hover:bg-neutral-800"
                  >
                    Sửa
                  </Link>
                  <Button
                    variant="ghost"
                    className="px-3 py-1.5 text-red-400 hover:text-red-300"
                    onClick={() => onDelete(plan)}
                  >
                    Xóa
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
