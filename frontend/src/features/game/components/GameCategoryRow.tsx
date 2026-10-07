import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/Button'
import { applyServerErrors } from '@/shared/utils/form-errors'

import { useUpdateGameCategory } from '../hooks/useUpdateGameCategory'
import { GAME_CATEGORY_FORM_FIELDS } from '../types/game.schema'
import type { GameCategory } from '../types/game.types'
import { toGameCategoryFormValues, toGameCategoryPayload } from '../utils/game.utils'
import { GameCategoryForm } from './GameCategoryForm'

interface GameCategoryRowProps {
  category: GameCategory
  editing: boolean
  onEdit: () => void
  onDone: () => void
  onDelete: (category: GameCategory) => void
}

/** Một thể loại trong trang quản trị: hiển thị, hoặc form sửa ngay tại chỗ khi `editing` */
export function GameCategoryRow({
  category,
  editing,
  onEdit,
  onDone,
  onDelete,
}: GameCategoryRowProps) {
  const updateCategory = useUpdateGameCategory()

  if (editing) {
    return (
      <li className="bg-neutral-900/60 px-4 py-4">
        <GameCategoryForm
          defaultValues={toGameCategoryFormValues(category)}
          submitLabel="Lưu"
          pending={updateCategory.isPending}
          onCancel={onDone}
          onSubmit={(values, { setError }) =>
            updateCategory.mutate(
              { id: category.id, payload: toGameCategoryPayload(values) },
              {
                onSuccess: () => {
                  toast.success(`Đã lưu thể loại ${values.name}`)
                  onDone()
                },
                onError: (error) => applyServerErrors(error, setError, GAME_CATEGORY_FORM_FIELDS),
              },
            )
          }
        />
      </li>
    )
  }

  const hasGames = category.gameCount > 0

  return (
    <li
      className={`flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 text-sm ${category.isActive ? '' : 'text-neutral-500'}`}
    >
      <span className="min-w-40 flex-1 font-semibold text-neutral-100">{category.name}</span>
      <span>{category.gameCount} game</span>
      <span>Thứ tự {category.sortOrder}</span>
      {category.isActive ? (
        <span className="text-green-400">Đang hiện</span>
      ) : (
        <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-xs">
          Đang ẩn (game chỉ có thể loại này sẽ ẩn theo)
        </span>
      )}
      <span className="flex gap-2">
        <Button variant="ghost" className="px-3 py-1.5 text-brand-400" onClick={onEdit}>
          Sửa
        </Button>
        <Button
          variant="ghost"
          className="px-3 py-1.5 text-red-400 hover:text-red-300"
          disabled={hasGames}
          title={
            hasGames ? `Còn ${category.gameCount} game, chuyển hoặc xóa game trước` : undefined
          }
          onClick={() => onDelete(category)}
        >
          Xóa
        </Button>
      </span>
    </li>
  )
}
