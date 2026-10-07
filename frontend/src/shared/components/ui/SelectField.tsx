import { useId, type Ref, type SelectHTMLAttributes } from 'react'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: SelectOption[]
  /** Dòng đầu chưa chọn (value = '') */
  placeholder?: string
  /** Thông báo lỗi của ô (từ React Hook Form hoặc `details` của server) */
  error?: string
  ref?: Ref<HTMLSelectElement>
}

/** Ô chọn có nhãn và dòng lỗi; cùng giao diện với TextField, dùng thẳng với `register()` */
export function SelectField({
  label,
  options,
  placeholder,
  error,
  id,
  className = '',
  ref,
  ...rest
}: SelectFieldProps) {
  const generatedId = useId()
  const selectId = id ?? generatedId
  const errorId = `${selectId}-error`

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={selectId} className="text-sm font-medium text-neutral-300">
        {label}
      </label>
      <select
        ref={ref}
        id={selectId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`rounded-lg border bg-neutral-900 px-3 py-2 text-neutral-100 focus:border-brand-500 focus:outline-none ${
          error ? 'border-red-500' : 'border-neutral-700'
        } ${className}`}
        {...rest}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
