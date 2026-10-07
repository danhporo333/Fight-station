import type { FieldErrors, UseFormRegister } from 'react-hook-form'

import { useGameCategories } from '../hooks/useGameCategories'
import type { GameFormInput } from '../types/game.schema'

interface GameCategoriesFieldProps {
  register: UseFormRegister<GameFormInput>
  errors: FieldErrors<GameFormInput>
}

/**
 * Chọn thể loại của game: ô tick, chọn 1–5 thể loại (khớp backend). Liệt kê cả thể loại đang ẩn
 * (ghi "đang ẩn") để sửa game cũ không bị mất thể loại.
 */
export function GameCategoriesField({ register, errors }: GameCategoriesFieldProps) {
  const { data: categories, isPending, error } = useGameCategories({ includeInactive: true })
  const errorId = 'game-categories-error'

  return (
    <fieldset
      className="flex flex-col gap-2"
      aria-describedby={errors.gameCategoryIds ? errorId : undefined}
    >
      <legend className="mb-1.5 text-sm font-medium text-neutral-300">
        Thể loại <span className="font-normal text-neutral-500">(chọn 1–5)</span>
      </legend>
      {isPending && <p className="text-sm text-neutral-500">Đang tải thể loại…</p>}
      {error && <p className="text-sm text-red-400">Không tải được danh sách thể loại</p>}
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {categories?.map((category) => (
          <label key={category.id} className="flex items-center gap-2 text-sm text-neutral-200">
            <input
              type="checkbox"
              value={String(category.id)}
              className="size-4 accent-brand-500"
              {...register('gameCategoryIds')}
            />
            {category.name}
            {!category.isActive && <span className="text-xs text-neutral-500">(đang ẩn)</span>}
          </label>
        ))}
      </div>
      {errors.gameCategoryIds?.message && (
        <p id={errorId} role="alert" className="text-sm text-red-400">
          {errors.gameCategoryIds.message}
        </p>
      )}
    </fieldset>
  )
}
