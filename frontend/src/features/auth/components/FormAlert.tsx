interface FormAlertProps {
  message?: string
}

/** Lỗi chung của form (không thuộc ô nào), vd sai mật khẩu, mất kết nối */
export function FormAlert({ message }: FormAlertProps) {
  if (!message) return null
  return (
    <p
      role="alert"
      className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300"
    >
      {message}
    </p>
  )
}
