import { formatVndShort } from '@/shared/utils/format'

import type { MenuEntry } from '../types/menu.types'
import { BestSellerBadge } from './BestSellerBadge'

interface MenuPriceRowProps {
  item: MenuEntry
}

/**
 * Một dòng bảng giá kiểu tờ menu: "Tên món ······ 35K", mô tả nhỏ bên dưới (vị, số lượng).
 * Bán chạy: huy hiệu "Best seller". Tạm hết: vẫn hiện nhưng mờ, giá gạch ngang, nhãn "Hết".
 * Có ảnh thì hiện ô vuông nhỏ bên trái.
 */
export function MenuPriceRow({ item }: MenuPriceRowProps) {
  const soldOut = !item.isAvailable

  return (
    <li className={`flex items-start gap-3 py-1.5 ${soldOut ? 'opacity-50' : ''}`}>
      {item.imageUrl && (
        <img
          src={item.imageUrl}
          alt={item.name}
          loading="lazy"
          width={40}
          height={40}
          className="size-10 shrink-0 object-cover"
        />
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <p className="min-w-0 leading-snug font-semibold">
            {item.name}
            {item.isBestSeller && (
              <>
                {' '}
                <BestSellerBadge />
              </>
            )}
            {soldOut && (
              <span className="ml-2 border border-neon-red/60 px-1.5 font-mono text-[10px] tracking-wider whitespace-nowrap text-neon-red uppercase">
                Hết
              </span>
            )}
          </p>
          {/* Đường chấm nối tên với giá, như tờ menu */}
          <span
            aria-hidden="true"
            className="min-w-6 flex-1 -translate-y-1 border-b border-dotted border-brand-500/35"
          />
          <p
            className={`shrink-0 font-mono font-bold text-neon-gold ${
              soldOut ? 'line-through' : '[text-shadow:0_0_10px_rgb(255_196_0/0.4)]'
            }`}
          >
            <span className="sr-only">Giá </span>
            {formatVndShort(item.priceVnd)}
          </p>
        </div>
        {item.description && (
          <p className="mt-0.5 text-xs leading-relaxed text-muted">{item.description}</p>
        )}
      </div>
    </li>
  )
}
