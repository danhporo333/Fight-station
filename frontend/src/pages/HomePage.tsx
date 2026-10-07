import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'

/** Trang chủ (placeholder). Sau này ghép GameList, PricePlanList, MenuList, BranchList... từ các feature. */
export function HomePage() {
  useDocumentTitle()

  return (
    <section className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-24 text-center">
      <p className="rounded-full border border-brand-700 px-3 py-1 text-sm text-brand-300">
        Quán PS5
      </p>
      <h1 className="text-5xl font-black tracking-tight">
        Fight <span className="text-brand-500">Station</span>
      </h1>
      <p className="max-w-xl text-neutral-400">
        Khung giao diện đã sẵn sàng. Game, bảng giá, menu và chi nhánh sẽ hiện ở đây khi thêm từng
        feature.
      </p>
    </section>
  )
}
