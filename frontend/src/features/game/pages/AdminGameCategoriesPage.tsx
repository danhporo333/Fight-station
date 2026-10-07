import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/Button'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'
import { getErrorMessage } from '@/shared/utils/error-messages'
import { applyServerErrors } from '@/shared/utils/form-errors'

import { GameCategoryForm } from '../components/GameCategoryForm'
import { GameCategoryRow } from '../components/GameCategoryRow'
import { useCreateGameCategory } from '../hooks/useCreateGameCategory'
import { useDeleteGameCategory } from '../hooks/useDeleteGameCategory'
import { useGameCategories } from '../hooks/useGameCategories'
import { GAME_CATEGORY_FORM_FIELDS } from '../types/game.schema'
import type { GameCategory } from '../types/game.types'
import { EMPTY_GAME_CATEGORY_FORM, toGameCategoryPayload } from '../utils/game.utils'

export function AdminGameCategoriesPage() {
  useDocumentTitle('Thể loại game')
  const {
    data: categories,
    isPending,
    error,
    refetch,
  } = useGameCategories({
    includeInactive: true,
  })
  const createCategory = useCreateGameCategory()
  const deleteCategory = useDeleteGameCategory()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [toDelete, setToDelete] = useState<GameCategory | null>(null)

  const confirmDelete = () => {
    if (!toDelete) return
    deleteCategory.mutate(toDelete.id, {
      onSuccess: () => toast.success(`Đã xóa thể loại ${toDelete.name}`),
      onError: (err) => toast.error(getErrorMessage(err)),
      onSettled: () => setToDelete(null),
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Thể loại game</h1>

      <section className="rounded-xl border border-neutral-800 p-4">
        <h2 className="mb-3 font-semibold">Thêm thể loại</h2>
        <GameCategoryForm
          defaultValues={EMPTY_GAME_CATEGORY_FORM}
          submitLabel="Thêm"
          pending={createCategory.isPending}
          onSubmit={(values, { setError, reset }) =>
            createCategory.mutate(toGameCategoryPayload(values), {
              onSuccess: ({ data }) => {
                toast.success(`Đã thêm thể loại ${data.name}`)
                reset()
              },
              onError: (err) => applyServerErrors(err, setError, GAME_CATEGORY_FORM_FIELDS),
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

      {categories?.length === 0 && <p className="text-neutral-400">Chưa có thể loại nào.</p>}

      {categories && categories.length > 0 && (
        <ul className="divide-y divide-neutral-800 rounded-xl border border-neutral-800">
          {categories.map((category) => (
            <GameCategoryRow
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
        title={`Xóa thể loại “${toDelete?.name ?? ''}”?`}
        loading={deleteCategory.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      >
        Xóa thật, không khôi phục được. Muốn tạm ẩn thì bấm “Sửa” và bỏ chọn “Đang hoạt động”.
      </ConfirmDialog>
    </div>
  )
}
