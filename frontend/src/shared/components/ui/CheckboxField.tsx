import { useId, type InputHTMLAttributes, type Ref } from 'react'

export interface CheckboxFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  /** Dòng giải thích nhỏ dưới nhãn */
  hint?: string
  ref?: Ref<HTMLInputElement>
}

/** Ô bật/tắt có nhãn (vd "Đang hoạt động"); dùng thẳng với `register()` của React Hook Form */
export function CheckboxField({
  label,
  hint,
  id,
  className = '',
  ref,
  ...rest
}: CheckboxFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className="flex items-start gap-3">
      <input
        ref={ref}
        id={inputId}
        type="checkbox"
        className={`mt-1 size-4 accent-brand-500 ${className}`}
        {...rest}
      />
      <label htmlFor={inputId} className="flex flex-col">
        <span className="text-sm font-medium text-neutral-200">{label}</span>
        {hint && <span className="text-xs text-neutral-500">{hint}</span>}
      </label>
    </div>
  )
}
