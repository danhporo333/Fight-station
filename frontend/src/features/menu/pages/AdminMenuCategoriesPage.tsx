import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/Button'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'
import { getErrorMessage } from '@/shared/utils/error-messages'

import { MenuCategoryForm } from '../components/MenuCategoryForm'
import { MenuCategoryRow } from '../components/MenuCategoryRow'
import { useCreateMenuCategory } from '../hooks/useCreateMenuCategory'
import { useDeleteMenuCategory } from '../hooks/useDeleteMenuCategory'
import { useMenuCategories } from '../hooks/useMenuCategories'
import type { MenuCategory } from '../types/menu.types'
import { applyMenuCategoryErrors } from '../utils/menu-form-errors'
import { EMPTY_MENU_CATEGORY_FORM, toMenuCategoryPayload } from '../utils/menu.utils'

export function AdminMenuCategoriesPage() {
  useDocumentTitle('Nhóm menu')
  const {
    data: categories,
    isPending,
    error,
    refetch,
  } = useMenuCategories({
    includeInactive: true,
  })
  const createCategory = useCreateMenuCategory()
  const deleteCategory = useDeleteMenuCategory()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [toDelete, setToDelete] = useState<MenuCategory | null>(null)

  const confirmDelete = () => {
    if (!toDelete) return
    deleteCategory.mutate(toDelete.id, {
      onSuccess: () => toast.success(`Đã xóa nhóm ${toDelete.name}`),
      // MENU_004 (nhóm còn món) báo bằng toast
      onError: (err) => toast.error(getErrorMessage(err)),
      onSettled: () => setToDelete(null),
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Nhóm menu</h1>

      <section className="rounded-xl border border-neutral-800 p-4">
        <h2 className="mb-3 font-semibold">Thêm nhóm</h2>
        <MenuCategoryForm
          defaultValues={EMPTY_MENU_CATEGORY_FORM}
          submitLabel="Thêm"
          pending={createCategory.isPending}
          onSubmit={(values, { setError, reset }) =>
            createCategory.mutate(toMenuCategoryPayload(values), {
              onSuccess: ({ data }) => {
                toast.success(`Đã thêm nhóm ${data.name}`)
                reset()
              },
              onError: (err) => applyMenuCategoryErrors(err, setError),
            })
          }
        />
      </section>

      {isPending && (
        <div aria-hidden="true" className="h-48 animate-pulse rounded-xl bg-neutral-900" />
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

      {categories?.length === 0 && <p className="text-neutral-400">Chưa có nhóm nào.</p>}

      {categories && categories.length > 0 && (
        <ul className="divide-y divide-neutral-800 rounded-xl border border-neutral-800">
          {categories.map((category) => (
            <MenuCategoryRow
              key={category.id}
              category={category}
              editing={editingId === category.id}
              onEdit={() => setEditingId(category.id)}
              onDone={() => setEditingId(null)}
              onDelete={setToDelete}
            />
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title={`Xóa nhóm “${toDelete?.name ?? ''}”?`}
        loading={deleteCategory.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      >
        Xóa thật, không khôi phục được. Muốn tạm ẩn thì bấm “Sửa” và bỏ chọn “Đang hoạt động”.
      </ConfirmDialog>
    </div>
  )
}
