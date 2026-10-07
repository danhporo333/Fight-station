import type { UseFormRegisterReturn } from 'react-hook-form'

import { ACCENT_OPTIONS, ACCENT_SWATCH_CLASS } from '../utils/accent'

interface AccentColorFieldProps {
  /** `register('accentColor')` của form */
  registration: UseFormRegisterReturn<'accentColor'>
}

/** Chọn màu nhấn: 4 ô màu dạng radio (có chữ cho trình đọc màn hình) */
export function AccentColorField({ registration }: AccentColorFieldProps) {
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1.5 text-sm font-medium text-neutral-300">Màu nhấn</legend>
      <div className="flex flex-wrap gap-4">
        {ACCENT_OPTIONS.map((option) => (
          <label key={option.value} className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="radio" value={option.value} className="peer sr-only" {...registration} />
            <span
              aria-hidden="true"
              className={`size-7 rounded-full ring-2 ring-transparent ring-offset-2 ring-offset-neutral-950 peer-checked:ring-white peer-focus-visible:ring-brand-400 ${ACCENT_SWATCH_CLASS[option.value]}`}
            />
            <span className="text-neutral-300">{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
