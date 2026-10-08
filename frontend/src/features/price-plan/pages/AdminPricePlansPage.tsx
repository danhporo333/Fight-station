import { useState } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/Button'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'
import { getErrorMessage } from '@/shared/utils/error-messages'

import { PricePlanTable } from '../components/PricePlanTable'
import { useDeletePricePlan } from '../hooks/useDeletePricePlan'
import { usePricePlans } from '../hooks/usePricePlans'
import { useUpdatePricePlan } from '../hooks/useUpdatePricePlan'
import type { PricePlan } from '../types/price-plan.types'

export function AdminPricePlansPage() {
  useDocumentTitle('Quản lý bảng giá')
  const { data: plans, isPending, error, refetch } = usePricePlans({ includeInactive: true })
  const updatePlan = useUpdatePricePlan()
  const deletePlan = useDeletePricePlan()
  const [toDelete, setToDelete] = useState<PricePlan | null>(null)

  // Đổi nhanh ẩn/hiện: PUT chỉ gửi isActive, quyền lợi giữ nguyên
  const toggleActive = (plan: PricePlan) =>
    updatePlan.mutate(
      { id: plan.id, payload: { isActive: !plan.isActive } },
      {
        onSuccess: ({ data }) =>
          toast.success(`${data.name}: ${data.isActive ? 'đang hiện' : 'đã ẩn'}`),
        onError: (err) => toast.error(getErrorMessage(err)),
      },
    )

  const confirmDelete = () => {
    if (!toDelete) return
    deletePlan.mutate(toDelete.id, {
      onSuccess: () => toast.success(`Đã xóa gói ${toDelete.name}`),
      onError: (err) => toast.error(getErrorMessage(err)),
      onSettled: () => setToDelete(null),
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Bảng giá</h1>
        <Link
          to="/admin/price-plans/new"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500"
        >
          Thêm gói
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

      {plans?.length === 0 && (
        <p className="text-neutral-400">Chưa có gói nào. Bấm “Thêm gói” để bắt đầu.</p>
      )}

      {plans && plans.length > 0 && (
        <PricePlanTable
          plans={plans}
          togglingId={updatePlan.isPending ? (updatePlan.variables?.id ?? null) : null}
          onToggleActive={toggleActive}
          onDelete={setToDelete}
        />
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title={`Xóa gói “${toDelete?.name ?? ''}”?`}
        loading={deletePlan.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      >
        Xóa thật (cả danh sách quyền lợi), không khôi phục được. Muốn ẩn tạm khỏi trang khách thì
        bấm nút “Đang hiện” để chuyển sang “Đang ẩn”.
      </ConfirmDialog>
    </div>
  )
}
