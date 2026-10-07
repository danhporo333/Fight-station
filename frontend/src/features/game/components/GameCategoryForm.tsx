import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type UseFormSetError } from 'react-hook-form'

import { Button } from '@/shared/components/ui/Button'
import { CheckboxField } from '@/shared/components/ui/CheckboxField'
import { FormAlert } from '@/shared/components/ui/FormAlert'
import { TextField } from '@/shared/components/ui/TextField'

import { gameCategoryFormSchema, type GameCategoryFormInput } from '../types/game.schema'

interface GameCategoryFormProps {
  defaultValues: GameCategoryFormInput
  submitLabel: string
  pending: boolean
  /** Trang cha gọi mutation; `reset()` để xóa trắng form sau khi thêm, `setError` gán lỗi server */
  onSubmit: (
    values: GameCategoryFormInput,
    helpers: { setError: UseFormSetError<GameCategoryFormInput>; reset: () => void },
  ) => void
  onCancel?: () => void
}

/** Form thể loại gọn trên một hàng: tên, thứ tự, đang hoạt động. Dùng cho thêm mới và sửa trên bảng. */
export function GameCategoryForm({
  defaultValues,
  submitLabel,
  pending,
  onSubmit,
  onCancel,
}: GameCategoryFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isDirty },
  } = useForm<GameCategoryFormInput>({
    resolver: zodResolver(gameCategoryFormSchema),
    defaultValues,
  })

  return (
    <form
      onSubmit={handleSubmit((values) => onSubmit(values, { setError, reset: () => reset() }))}
      noValidate
      className="flex flex-col gap-3"
    >
      <FormAlert message={errors.root?.server?.message} />
      <div className="grid items-start gap-3 sm:grid-cols-[1fr_8rem_auto_auto]">
        <TextField label="Tên thể loại" error={errors.name?.message} {...register('name')} />
        <TextField
          label="Thứ tự"
          inputMode="numeric"
          error={errors.sortOrder?.message}
          {...register('sortOrder')}
        />
        <div className="sm:pt-8">
          <CheckboxField label="Đang hoạt động" {...register('isActive')} />
        </div>
        <div className="flex gap-2 sm:pt-6">
          <Button type="submit" loading={pending} disabled={!isDirty}>
            {submitLabel}
          </Button>
          {onCancel && (
            <Button variant="ghost" disabled={pending} onClick={onCancel}>
              Hủy
            </Button>
          )}
        </div>
      </div>
    </form>
  )
}
