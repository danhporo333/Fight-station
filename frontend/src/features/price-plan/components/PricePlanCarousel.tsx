import { Marquee } from '@/shared/components/ui/Marquee'

import { usePricePlans } from '../hooks/usePricePlans'
import { PricePlanCard } from './PricePlanCard'
import { PricePlanList } from './PricePlanList'
import { PricePlanNotes } from './PricePlanNotes'

/**
 * Ít hơn số này thì một bản lặp ngắn hơn chiều rộng màn hình, dải trượt sẽ hở khoảng trống: hiện lưới
 * thường. Thẻ rộng 20rem + lề 1.5rem, 5 thẻ ≈ 1.720px.
 */
const MIN_FOR_CAROUSEL = 5

/**
 * Dải bảng giá trang chủ, tự trượt sang **phải** (ngược hướng với `GameCarousel`), dùng `Marquee`.
 * Đang tải, lỗi hoặc ít gói thì hiện `PricePlanList` (đã có đủ 3 trạng thái).
 */
export function PricePlanCarousel() {
  const { data: plans, isPending } = usePricePlans()

  if (isPending || !plans || plans.length < MIN_FOR_CAROUSEL) return <PricePlanList />

  return (
    <>
      {/* pt/pb chừa chỗ cho nhãn HOT (-top-3) và thẻ nhấc lên khi rê chuột, vì khung cắt cả chiều dọc */}
      <Marquee
        label="Bảng giá các loại phòng, tự trượt; rê chuột để dừng"
        direction="right"
        className="pt-4 pb-3"
      >
        {plans.map((plan) => (
          // Khoảng cách bằng lề phải (không dùng gap) để 2 bản lặp dài đúng bằng nhau
          <PricePlanCard
            key={plan.id}
            plan={plan}
            headingLevel="h3"
            className="mr-6 w-80 shrink-0"
          />
        ))}
      </Marquee>
      <PricePlanNotes />
    </>
  )
}
