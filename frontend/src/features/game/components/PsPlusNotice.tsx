import { Sparkles } from 'lucide-react'

/** Nội dung thông báo: sửa chữ ở đây, trang chủ và /games đổi theo */
const NOTICE_TITLE = 'Còn hàng trăm game PS Plus nữa'
const NOTICE_TEXT =
  'Ngoài các game bên dưới, quán còn nhiều game khác trên tài khoản PS Plus. Hỏi nhân viên để chơi nhé.'

/** Khung nhắc khách: danh sách game trên web chưa gồm thư viện PS Plus của quán */
export function PsPlusNotice() {
  return (
    <aside
      role="note"
      className="mx-auto mb-10 flex max-w-2xl items-start gap-4 border border-brand-500/40 bg-brand-500/5 px-5 py-4"
    >
      <Sparkles aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-brand-500" />
      <div>
        <p className="font-display text-sm font-bold tracking-[0.1em] text-brand-500 uppercase">
          {NOTICE_TITLE}
        </p>
        <p className="mt-1 text-sm text-muted sm:text-base">{NOTICE_TEXT}</p>
      </div>
    </aside>
  )
}
