import { Star } from 'lucide-react'

/** Huy hiệu "Best seller" (món bán chạy), dùng ở trang khách và bảng quản trị */
export function BestSellerBadge() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 border border-neon-gold/60 px-1.5 py-px font-mono text-[10px] leading-4 font-bold tracking-wider whitespace-nowrap text-neon-gold uppercase">
      <Star aria-hidden="true" className="size-2.5 fill-current" />
      Best seller
    </span>
  )
}
