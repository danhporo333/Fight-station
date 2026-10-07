import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/Button'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'
import { getErrorMessage } from '@/shared/utils/error-messages'

import { AdminMenuFilters } from '../components/AdminMenuFilters'
import { MenuItemTable } from '../components/MenuItemTable'
import { useDeleteMenuItem } from '../hooks/useDeleteMenuItem'
import { useMenuItems } from '../hooks/useMenuItems'
import { useUpdateMenuItem } from '../hooks/useUpdateMenuItem'
import type { MenuItem } from '../types/menu.types'
import { MENU_SEARCH_PARAMS, readIdParam } from '../utils/menu.utils'

export function AdminMenuPage() {
  useDocumentTitle('Quản lý menu')
  const [searchParams] = useSearchParams()
  const q = searchParams.get(MENU_SEARCH_PARAMS.q)?.trim() || undefined
  const categoryId = readIdParam(searchParams.get(MENU_SEARCH_PARAMS.category))
  const {
    data: items,
    isPending,
    error,
    refetch,
  } = useMenuItems({
    includeInactive: true,
    q,
    categoryId,
  })
  const updateItem = useUpdateMenuItem()
  const deleteItem = useDeleteMenuItem()
  const [toDelete, setToDelete] = useState<MenuItem | null>(null)

  // Đổi nhanh "Tạm hết / Còn hàng": PUT chỉ gửi isAvailable
  const toggleAvailable = (item: MenuItem) =>
    updateItem.mutate(
      { id: item.id, payload: { isAvailable: !item.isAvailable } },
      {
        onSuccess: ({ data }) =>
          toast.success(`${data.name}: ${data.isAvailable ? 'còn hàng' : 'tạm hết'}`),
        onError: (err) => toast.error(getErrorMessage(err)),
      },
    )

  const confirmDelete = () => {
    if (!toDelete) return
    deleteItem.mutate(toDelete.id, {
      onSuccess: () => toast.success(`Đã xóa món ${toDelete.name}`),
      onError: (err) => toast.error(getErrorMessage(err)),
      onSettled: () => setToDelete(null),
    })
  }

  const filtered = q !== undefined || categoryId !== undefined

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Menu</h1>
        <div className="flex gap-3">
          <Link
            to="/admin/menu-categories"
            className="rounded-lg border border-neutral-700 px-4 py-2 text-sm font-semibold hover:border-brand-500"
          >
            Nhóm menu
          </Link>
          <Link
            // Đang lọc theo nhóm thì form thêm chọn sẵn nhóm đó
            to={
              categoryId
                ? `/admin/menu/new?${MENU_SEARCH_PARAMS.category}=${categoryId}`
                : '/admin/menu/new'
            }
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500"
          >
            Thêm món
          </Link>
        </div>
      </header>

      <AdminMenuFilters />

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

      {items?.length === 0 && (
        <p className="text-neutral-400">
          {filtered
            ? 'Không có món nào khớp bộ lọc.'
            : 'Chưa có món nào. Bấm “Thêm món” để bắt đầu.'}
        </p>
      )}

      {items && items.length > 0 && (
        <MenuItemTable
          items={items}
          togglingId={updateItem.isPending ? (updateItem.variables?.id ?? null) : null}
          onToggleAvailable={toggleAvailable}
          onDelete={setToDelete}
        />
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title={`Xóa món “${toDelete?.name ?? ''}”?`}
        loading={deleteItem.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      >
        Xóa thật, không khôi phục được. Hết hàng tạm thời thì bấm “Còn hàng” để chuyển sang “Tạm
        hết”; muốn ẩn hẳn thì vào “Sửa” và bỏ chọn “Đang hoạt động”.
      </ConfirmDialog>
    </div>
  )
}
