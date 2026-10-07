import type { ReactNode } from 'react'

import { useShop } from '../hooks/useShop'
import { HeroController } from './HeroController'

export interface HeroStat {
  value: string
  label: string
}

interface ShopHeroProps {
  /** Số liệu của feature khác (vd số chi nhánh, máy PS5), trang ghép tính rồi truyền vào */
  stats?: HeroStat[]
  /** Các nút hành động (trang ghép truyền link vào) */
  actions?: ReactNode
}

const DEFAULT_NAME = 'Fight Station'

/**
 * Hero trang chủ (theo prototype): badge, tên quán (chữ đầu nhiễu màu, phần sau chữ viền), tagline,
 * nút hành động, hàng số liệu và hình tay cầm. Tên quán hiện ngay (mặc định khi chưa có dữ liệu);
 * tagline và "Giờ mở cửa" hiện khi có dữ liệu, lỗi thì bỏ qua.
 */
export function ShopHero({ stats = [], actions }: ShopHeroProps) {
  const { data: shop, isPending } = useShop()
  const [first = '', ...rest] = (shop?.name ?? DEFAULT_NAME).trim().split(/\s+/)
  const allStats = [
    ...stats,
    ...(shop?.hoursLabel ? [{ value: shop.hoursLabel, label: 'Giờ mở cửa' }] : []),
  ].filter((stat) => stat.value !== '' && stat.value !== '0')

  return (
    <section className="relative overflow-hidden">
      {/* Hai quầng sáng mờ phía sau */}
      <div
        aria-hidden="true"
        className="absolute top-1/5 -right-1/10 size-[600px] rounded-full bg-radial from-neon-red/25 to-transparent to-70% blur-[60px]"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-1/10 -left-1/10 size-[500px] rounded-full bg-radial from-brand-500/20 to-transparent to-70% blur-[60px]"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 lg:min-h-[calc(100vh-4rem)] lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
        <div>
          <p className="mb-6 inline-flex items-center gap-2 border border-brand-500 bg-brand-500/5 px-4 py-1.5 font-mono text-xs tracking-[0.2em] text-brand-500 uppercase">
            <span className="size-2 animate-pulse rounded-full bg-brand-500 shadow-[0_0_10px_var(--color-brand-500)]" />
            System online — Ready player one
          </p>

          <h1 className="mb-6 font-display text-5xl leading-[0.95] font-black uppercase sm:text-7xl lg:text-8xl">
            <span className="inline-block animate-glitch text-ink">{first}</span>{' '}
            {rest.length > 0 && <span className="text-outline block">{rest.join(' ')}</span>}
          </h1>

          {isPending ? (
            <div aria-hidden="true" className="mb-10 h-20 max-w-xl animate-pulse bg-card" />
          ) : (
            shop?.tagline && (
              <p className="mb-10 max-w-xl text-lg text-muted sm:text-xl">{shop.tagline}</p>
            )
          )}

          {actions && <div className="flex flex-wrap gap-4">{actions}</div>}

          {allStats.length > 0 && (
            <dl className="mt-12 flex flex-wrap gap-x-8 gap-y-6 border-t border-brand-500/20 pt-8">
              {allStats.map((stat) => (
                <div key={stat.label} className="flex flex-col-reverse">
                  <dt className="mt-1 font-mono text-xs tracking-[0.15em] text-muted uppercase">
                    {stat.label}
                  </dt>
                  <dd className="text-glow font-display text-4xl leading-none font-black text-brand-500">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        <div className="mx-auto w-full max-w-md lg:max-w-none">
          <HeroController />
        </div>
      </div>
    </section>
  )
}
