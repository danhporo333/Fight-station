import { useId, type InputHTMLAttributes, type Ref } from 'react'

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  /** Thông báo lỗi của ô (từ React Hook Form hoặc `details` của server) */
  error?: string
  ref?: Ref<HTMLInputElement>
}

/** Ô nhập có nhãn và dòng lỗi; dùng được thẳng với `register()` của React Hook Form */
export function TextField({ label, error, id, className = '', ref, ...rest }: TextFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const errorId = `${inputId}-error`

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-neutral-300">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`rounded-lg border bg-neutral-900 px-3 py-2 text-neutral-100 placeholder:text-neutral-500 focus:border-brand-500 focus:outline-none ${
          error ? 'border-red-500' : 'border-neutral-700'
        } ${className}`}
        {...rest}
      />
      {error && (
        <p id={errorId} role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
