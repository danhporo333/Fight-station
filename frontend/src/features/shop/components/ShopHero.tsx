import { useShop } from '../hooks/useShop'

/**
 * Hero trang chủ: tên quán, tagline, giờ mở cửa. Tên quán luôn hiện ngay (không chờ API);
 * tagline và giờ mở cửa hiện khi có dữ liệu, lỗi thì bỏ qua.
 */
export function ShopHero() {
  const { data: shop, isPending } = useShop()

  return (
    <section className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-24 text-center">
      {shop?.hoursLabel && (
        <p className="rounded-full border border-brand-700 px-3 py-1 text-sm text-brand-300">
          Mở cửa {shop.hoursLabel}
        </p>
      )}
      <h1 className="text-5xl font-black tracking-tight text-brand-500">
        {shop?.name ?? 'Fight Station'}
      </h1>
      {isPending ? (
        <div
          aria-hidden="true"
          className="h-12 w-full max-w-xl animate-pulse rounded bg-neutral-800"
        />
      ) : (
        shop?.tagline && <p className="max-w-xl text-neutral-400">{shop.tagline}</p>
      )}
    </section>
  )
}
