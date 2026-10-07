import type { AccentColor } from '../types/game.types'

/** Màu nhấn của game → class Tailwind (token theme, không hardcode mã màu) */
export const ACCENT_TEXT_CLASS: Record<AccentColor, string> = {
  orange: 'text-brand-500',
  red: 'text-neon-red',
  amber: 'text-neon-amber',
  gold: 'text-neon-gold',
}

export const ACCENT_SWATCH_CLASS: Record<AccentColor, string> = {
  orange: 'bg-brand-500',
  red: 'bg-neon-red',
  amber: 'bg-neon-amber',
  gold: 'bg-neon-gold',
}

export const ACCENT_OPTIONS: { value: AccentColor; label: string }[] = [
  { value: 'orange', label: 'Cam' },
  { value: 'red', label: 'Đỏ' },
  { value: 'amber', label: 'Hổ phách' },
  { value: 'gold', label: 'Vàng' },
]
