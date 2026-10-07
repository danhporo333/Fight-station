import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-500',
  secondary: 'border border-neutral-700 bg-neutral-900 text-neutral-100 hover:border-brand-500',
  ghost: 'text-neutral-300 hover:bg-neutral-800 hover:text-white',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  /** Đang xử lý: hiện vòng xoay và khóa nút */
  loading?: boolean
}

export function Button({
  variant = 'primary',
  loading = false,
  disabled,
  type = 'button',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${VARIANT_CLASS[variant]} ${className}`}
      {...rest}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  )
}
