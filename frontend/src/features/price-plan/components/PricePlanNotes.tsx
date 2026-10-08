import { Info } from 'lucide-react'

// Lưu ý và phụ thu in trên tờ giá / tờ ROOM LIST. Chưa có bảng riêng trong database nên viết cố định
// ở đây; đổi nội dung thì sửa mảng này (hoặc thêm vào `shop` nếu muốn chủ quán tự sửa).
const NOTES = [
  'Nhận phòng tối thiểu 2 tiếng.',
  'Tất cả các phòng private đều không có camera.',
  'Nintendo Switch: +10K / giờ.',
  'Tay cầm thêm: +10K / giờ.',
  'Phụ thu từ người thứ 5: 20K / giờ / người.',
  'Phụ thu 10% tổng bill khi mang đồ ăn, nước uống bên ngoài vào (đồ có cồn: 100K).',
]

/** Lưu ý và phụ thu dưới bảng giá */
export function PricePlanNotes() {
  return (
    <aside
      aria-label="Lưu ý và phụ thu"
      className="mx-auto mt-10 max-w-3xl border border-brand-500/20 bg-card/60 p-5"
    >
      <ul className="flex flex-col gap-2 text-sm text-muted">
        {NOTES.map((note) => (
          <li key={note} className="flex items-start gap-2">
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand-500" />
            <span>{note}</span>
          </li>
        ))}
      </ul>
    </aside>
  )
}
