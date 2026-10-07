import { Clock, MapPin, Phone } from 'lucide-react'

import type { Branch } from '../types/branch.types'
import { mapHref, telHref, zaloHref } from '../utils/branch.utils'

interface BranchCardProps {
  branch: Branch
  /** Thứ tự hiển thị (bắt đầu từ 1), in thành "// CHI NHÁNH 001" */
  index: number
  /** Facebook của quán, dùng khi chi nhánh để trống facebookUrl */
  fallbackFacebookUrl?: string | null
}

const BUTTON_CLASS =
  'block border border-brand-500 px-3 py-2.5 text-center text-sm font-bold tracking-[0.1em] uppercase transition-colors'
const PRIMARY_CLASS = `${BUTTON_CLASS} bg-brand-500 text-void hover:border-neon-red hover:bg-neon-red`
const OUTLINE_CLASS = `${BUTTON_CLASS} text-brand-500 hover:bg-brand-500 hover:text-void`

/** Thẻ chi nhánh kiểu neon: địa chỉ, hotline, giờ mở cửa, số máy, nút Facebook / Zalo / chỉ đường */
export function BranchCard({ branch, index, fallbackFacebookUrl }: BranchCardProps) {
  const facebook = branch.facebookUrl ?? fallbackFacebookUrl ?? null
  const zalo = zaloHref(branch)
  const stats = [
    // { label: 'Máy PS5', value: branch.ps5Count > 0 ? String(branch.ps5Count) : null },
    { label: 'Phòng PS5', value: branch.vipRoomCount > 0 ? String(branch.vipRoomCount) : null },
    // Chỉ chi nhánh có phòng PC (pcRoomCount > 0) mới hiện ô này
    { label: 'Phòng PC', value: branch.pcRoomCount > 0 ? String(branch.pcRoomCount) : null },
    // { label: 'Diện tích', value: branch.areaM2 ? `${branch.areaM2}m²` : null },
  ].filter((stat) => stat.value !== null)

  return (
    <article className="relative flex flex-col overflow-hidden border border-brand-500/20 bg-card p-7 transition duration-300 before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-linear-90 before:from-brand-500 before:via-neon-red before:to-neon-amber hover:-translate-y-1 hover:border-brand-500 hover:shadow-[0_15px_40px_rgb(255_106_0/0.2)]">
      <p className="mb-2 font-mono text-xs tracking-[0.2em] text-neon-red text-center">
        CHI NHÁNH {String(index).padStart(2, '0')}
      </p>
      <h3 className="mb-5 text-2xl leading-snug font-bold uppercase text-center">{branch.name}</h3>

      <ul className="mb-6 divide-y divide-dashed divide-brand-500/15 text-sm">
        <li className="flex gap-3 py-2.5">
          <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand-500" />
          <span>{branch.address}</span>
        </li>
        {branch.phone && (
          <li className="flex gap-3 py-2.5">
            <Phone aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand-500" />
            <a href={telHref(branch.phone)} className="hover:text-brand-500">
              {branch.phone}
            </a>
          </li>
        )}
        {branch.openHours && (
          <li className="flex gap-3 py-2.5">
            <Clock aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand-500" />
            <span>{branch.openHours}</span>
          </li>
        )}
      </ul>

      {stats.length > 0 && (
        <dl className="mb-6 flex gap-2 border border-brand-500/15 bg-brand-500/5 px-2 py-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-1 flex-col-reverse items-center text-center">
              <dt className="mt-1 font-mono text-[0.7rem] leading-snug tracking-wider whitespace-pre-line text-muted uppercase">
                {stat.label}
              </dt>
              <dd className="font-display text-lg font-black whitespace-nowrap text-brand-500">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-auto flex flex-col gap-2">
        {facebook && (
          <a href={facebook} target="_blank" rel="noopener noreferrer" className={PRIMARY_CLASS}>
            Facebook
          </a>
        )}
        {zalo && (
          <a href={zalo} target="_blank" rel="noopener noreferrer" className={PRIMARY_CLASS}>
            Zalo
          </a>
        )}
        <a
          href={mapHref(branch)}
          target="_blank"
          rel="noopener noreferrer"
          className={OUTLINE_CLASS}
        >
          Đường Đi
        </a>
      </div>
    </article>
  )
}
