import { Link } from 'react-router'

import { Button } from '@/shared/components/ui/Button'
import { formatVnd } from '@/shared/utils/format'

import type { MenuItem } from '../types/menu.types'
import { BestSellerBadge } from './BestSellerBadge'

interface MenuItemTableProps {
  items: MenuItem[]
  /** Id món đang đổi "Tạm hết / Còn hàng" (khóa nút của dòng đó) */
  togglingId: number | null
  onToggleAvailable: (item: MenuItem) => void
  onDelete: (item: MenuItem) => void
}

const TH = 'px-4 py-3 font-medium'

/** Bảng món ở trang quản trị (gồm cả món đang ẩn), có nút đổi nhanh "Tạm hết / Còn hàng" */
export function MenuItemTable({
  items,
  togglingId,
  onToggleAvailable,
  onDelete,
}: MenuItemTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-800">
      <table className="w-full text-left text-sm">
        <thead className="bg-neutral-900 text-neutral-400">
          <tr>
            <th scope="col" className={TH}>
              Món
            </th>
            <th scope="col" className={TH}>
              Nhóm
            </th>
            <th scope="col" className={`${TH} text-right`}>
              Giá
            </th>
            <th scope="col" className={TH}>
              Còn hàng
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
          {items.map((item) => (
            <tr key={item.id} className={item.isActive ? '' : 'text-neutral-500'}>
              <td className="px-4 py-3">
                <p className="flex flex-wrap items-center gap-2 font-semibold text-neutral-100">
                  {item.name}
                  {item.isBestSeller && <BestSellerBadge />}
                </p>
                {item.description && <p className="text-xs text-neutral-500">{item.description}</p>}
              </td>
              <td className="px-4 py-3">{item.category.name}</td>
              <td className="px-4 py-3 text-right whitespace-nowrap">{formatVnd(item.priceVnd)}</td>
              <td className="px-4 py-3">
                {/* Nút riêng (không dùng Button) để màu chữ theo trạng thái không bị màu của variant đè */}
                <button
                  type="button"
                  disabled={togglingId === item.id}
                  aria-busy={togglingId === item.id}
                  aria-label={`${item.name}: ${item.isAvailable ? 'đang còn hàng, bấm để báo tạm hết' : 'đang tạm hết, bấm để báo còn hàng'}`}
                  onClick={() => onToggleAvailable(item)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold whitespace-nowrap transition hover:bg-neutral-800 disabled:cursor-wait disabled:opacity-60 ${
                    item.isAvailable
                      ? 'border-green-500/40 text-green-400'
                      : 'border-amber-500/50 text-amber-400'
                  }`}
                >
                  <span aria-hidden="true" className="size-2 rounded-full bg-current" />
                  {item.isAvailable ? 'Còn hàng' : 'Tạm hết'}
                </button>
              </td>
              <td className="px-4 py-3">
                {item.isActive ? (
                  <span className="text-green-400">Đang hiện</span>
                ) : (
                  <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-xs">Đang ẩn</span>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Link
                    to={`/admin/menu/${item.id}/edit`}
                    className="rounded-lg px-3 py-1.5 font-semibold text-brand-400 hover:bg-neutral-800"
                  >
                    Sửa
                  </Link>
                  <Button
                    variant="ghost"
                    className="px-3 py-1.5 text-red-400 hover:text-red-300"
                    onClick={() => onDelete(item)}
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
