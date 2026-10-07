import { useState } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/Button'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'
import { getErrorMessage } from '@/shared/utils/error-messages'

import { BranchTable } from '../components/BranchTable'
import { useBranches } from '../hooks/useBranches'
import { useDeleteBranch } from '../hooks/useDeleteBranch'
import type { Branch } from '../types/branch.types'

export function AdminBranchesPage() {
  useDocumentTitle('Quản lý chi nhánh')
  const { data: branches, isPending, error, refetch } = useBranches({ includeInactive: true })
  const deleteBranch = useDeleteBranch()
  const [toDelete, setToDelete] = useState<Branch | null>(null)

  const confirmDelete = () => {
    if (!toDelete) return
    deleteBranch.mutate(toDelete.id, {
      onSuccess: () => toast.success(`Đã xóa chi nhánh ${toDelete.name}`),
      onError: (err) => toast.error(getErrorMessage(err)),
      onSettled: () => setToDelete(null),
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Chi nhánh</h1>
        <Link
          to="/admin/branches/new"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500"
        >
          Thêm chi nhánh
        </Link>
      </header>

      {isPending && (
        <div aria-hidden="true" className="h-64 animate-pulse rounded-xl bg-neutral-900" />
      )}

      {error && (
        <div className="flex flex-col items-start gap-3">
          <p role="alert" className="text-sm text-red-400">
            {getErrorMessage(error)}
          </p>
          <Button variant="secondary" onClick={() => void refetch()}>
            Thử lại
          </Button>
        </div>
      )}

      {branches?.length === 0 && (
        <p className="text-neutral-400">Chưa có chi nhánh nào. Bấm “Thêm chi nhánh” để bắt đầu.</p>
      )}

      {branches && branches.length > 0 && (
        <BranchTable branches={branches} onDelete={setToDelete} />
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title={`Xóa chi nhánh “${toDelete?.name ?? ''}”?`}
        loading={deleteBranch.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      >
        Xóa thật, không khôi phục được. Game đang gắn với chi nhánh này sẽ tự được gỡ. Muốn tạm ẩn
        thì vào “Sửa” và bỏ chọn “Đang hoạt động”.
      </ConfirmDialog>
    </div>
  )
}
