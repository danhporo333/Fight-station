import { useEffect, useRef, type ReactNode } from 'react'

import { Button } from './Button'

export interface ConfirmDialogProps {
  open: boolean
  title: string
  children?: ReactNode
  confirmLabel?: string
  /** Đang xử lý: khóa nút, hiện vòng xoay */
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Hộp xác nhận dùng thẻ <dialog> của trình duyệt (tự khóa nền, Esc để đóng, focus đúng chỗ).
 * Dùng cho thao tác không hoàn tác được, vd xóa thật.
 */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = 'Xóa',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onCancel={(event) => {
        event.preventDefault()
        if (!loading) onCancel()
      }}
      aria-labelledby="confirm-dialog-title"
      className="m-auto w-full max-w-md rounded-xl border border-neutral-800 bg-neutral-900 p-6 text-neutral-100 backdrop:bg-black/70"
    >
      <h2 id="confirm-dialog-title" className="text-lg font-semibold">
        {title}
      </h2>
      {children && <div className="mt-2 text-sm text-neutral-400">{children}</div>}
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" disabled={loading} onClick={onCancel}>
          Hủy
        </Button>
        <Button
          loading={loading}
          onClick={onConfirm}
          className="bg-red-600 hover:bg-red-500"
          autoFocus
        >
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  )
}
