import { Marquee } from '@/shared/components/ui/Marquee'

import { useMenu } from '../hooks/useMenu'
import { MenuBoard } from './MenuBoard'
import { MenuPriceRow } from './MenuPriceRow'

/**
 * Ít hơn số này thì một bản lặp ngắn hơn chiều rộng màn hình, dải trượt sẽ hở khoảng trống: hiện bảng
 * menu thường. Khối rộng 20rem + lề 1.5rem, 5 khối ≈ 1.720px.
 */
const MIN_FOR_CAROUSEL = 5

/**
 * Menu trang chủ tự trượt sang trái như dải game (dùng `Marquee`): mỗi nhóm một khối có tiêu đề và các
 * dòng "Tên ···· 35K". Muốn xem đủ có trang /menu. Đang tải, lỗi hoặc ít nhóm thì hiện `MenuBoard`
 * (đã có đủ 3 trạng thái).
 */
export function MenuCarousel() {
  const { data: sections, isPending } = useMenu()

  if (isPending || !sections || sections.length < MIN_FOR_CAROUSEL) {
    return <MenuBoard />
  }

  return (
    <Marquee label="Menu đồ ăn, nước uống, tự trượt; rê chuột để dừng">
      {sections.map((section) => (
        // Khoảng cách bằng lề phải (không dùng gap) để 2 bản lặp dài đúng bằng nhau
        <li
          key={section.id}
          className="mr-6 w-80 shrink-0 border border-brand-500/20 bg-card/80 p-5"
        >
          <h3 className="mb-2 inline-block clip-skew bg-brand-500 px-5 py-1.5 text-sm font-bold tracking-[0.15em] text-void uppercase">
            {section.name}
          </h3>
          <ul>
            {section.items.map((item) => (
              <MenuPriceRow key={item.id} item={item} />
            ))}
          </ul>
        </li>
      ))}
    </Marquee>
  )
}
