import type { ReactNode } from 'react'

export interface MarqueeProps {
  /** Mô tả vùng cho trình đọc màn hình, vd "Game nổi bật, tự trượt; rê chuột để dừng" */
  label: string
  /** `left`: nội dung trượt sang trái (mặc định); `right`: trượt sang phải */
  direction?: 'left' | 'right'
  /** Class thêm cho khung ngoài, vd `pt-4 pb-3` chừa chỗ cho thẻ nhấc lên (khung cắt cả chiều dọc) */
  className?: string
  /** Class thêm cho mỗi hàng, vd `items-start` để các thẻ không bị kéo cao bằng nhau */
  listClassName?: string
  /**
   * Các `<li>` của một bản. Mỗi `<li>` phải tự có chiều rộng cố định và khoảng cách bằng lề/padding
   * (không dùng `gap`) để hai bản lặp dài đúng bằng nhau; một bản cũng phải dài hơn màn hình, nếu
   * không dải sẽ hở khoảng trống (nơi dùng tự kiểm tra số lượng).
   */
  children: ReactNode
}

/**
 * Dải tự trượt liên tục (trang chủ: game, bảng giá, menu). Danh sách lặp 2 lần và trượt đúng nửa chiều
 * dài rồi quay về đầu nên nối liền mạch. Rê chuột / focus thì dừng; người dùng bật "giảm chuyển động"
 * thì không chạy, thay bằng cuộn ngang. Hai mép mờ dần. Keyframes `marquee` / `marquee-reverse` nằm ở
 * `styles/index.css` (60s một vòng).
 */
export function Marquee({
  label,
  direction = 'left',
  className = '',
  listClassName = '',
  children,
}: MarqueeProps) {
  const animation = direction === 'left' ? 'animate-marquee' : 'animate-marquee-reverse'

  return (
    <div
      role="region"
      aria-label={label}
      className={`group overflow-x-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)] motion-reduce:overflow-x-auto ${className}`}
    >
      <div
        className={`flex w-max ${animation} group-focus-within:[animation-play-state:paused] group-hover:[animation-play-state:paused]`}
      >
        {/* Bản thứ 2 lặp lại để nối liền mạch, ẩn với trình đọc màn hình */}
        {[false, true].map((copy) => (
          <ul
            key={String(copy)}
            aria-hidden={copy || undefined}
            className={`flex ${listClassName}`}
          >
            {children}
          </ul>
        ))}
      </div>
    </div>
  )
}
