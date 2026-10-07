import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type UseFormSetError } from 'react-hook-form'

import { Button } from '@/shared/components/ui/Button'
import { CheckboxField } from '@/shared/components/ui/CheckboxField'
import { FormAlert } from '@/shared/components/ui/FormAlert'
import { TextField } from '@/shared/components/ui/TextField'

import { menuCategoryFormSchema, type MenuCategoryFormInput } from '../types/menu.schema'

interface MenuCategoryFormProps {
  defaultValues: MenuCategoryFormInput
  submitLabel: string
  pending: boolean
  /** Trang cha gọi mutation; `reset()` để xóa trắng form sau khi thêm, `setError` gán lỗi server */
  onSubmit: (
    values: MenuCategoryFormInput,
    helpers: { setError: UseFormSetError<MenuCategoryFormInput>; reset: () => void },
  ) => void
  onCancel?: () => void
}

/** Form nhóm menu gọn trên một hàng: tên, thứ tự, đang hoạt động. Dùng cho thêm mới và sửa tại chỗ. */
export function MenuCategoryForm({
  defaultValues,
  submitLabel,
  pending,
  onSubmit,
  onCancel,
}: MenuCategoryFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isDirty },
  } = useForm<MenuCategoryFormInput>({
    resolver: zodResolver(menuCategoryFormSchema),
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
        <TextField label="Tên nhóm" error={errors.name?.message} {...register('name')} />
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
