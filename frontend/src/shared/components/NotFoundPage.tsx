import { Link } from 'react-router'

import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'

export function NotFoundPage() {
  useDocumentTitle('Không tìm thấy trang')

  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-6xl font-black text-brand-500">404</p>
      <h1 className="text-2xl font-bold">Không tìm thấy trang</h1>
      <p className="text-neutral-400">Đường dẫn không tồn tại hoặc đã bị đổi.</p>
      <Link
        to="/"
        className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-500"
      >
        Về trang chủ
      </Link>
    </section>
  )
}
