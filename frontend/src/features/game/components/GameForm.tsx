import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch, type UseFormSetError } from 'react-hook-form'
import { Link } from 'react-router'

import { Button } from '@/shared/components/ui/Button'
import { CheckboxField } from '@/shared/components/ui/CheckboxField'
import { FormAlert } from '@/shared/components/ui/FormAlert'
import { TextAreaField } from '@/shared/components/ui/TextAreaField'
import { TextField } from '@/shared/components/ui/TextField'

import { gameFormSchema, type GameFormInput } from '../types/game.schema'
import { AccentColorField } from './AccentColorField'
import { GameBranchesField } from './GameBranchesField'
import { GameCategoriesField } from './GameCategoriesField'

interface GameFormProps {
  defaultValues: GameFormInput
  submitLabel: string
  pending: boolean
  /** Trang cha gọi mutation; lỗi server gán lại vào form qua `setError` */
  onSubmit: (values: GameFormInput, setError: UseFormSetError<GameFormInput>) => void
}

/** Form thêm/sửa game (Admin). Dùng chung cho trang thêm và trang sửa. */
export function GameForm({ defaultValues, submitLabel, pending, onSubmit }: GameFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isDirty },
  } = useForm<GameFormInput>({ resolver: zodResolver(gameFormSchema), defaultValues })
  const allBranches = useWatch({ control, name: 'allBranches' })

  return (
    <form
      onSubmit={handleSubmit((values) => onSubmit(values, setError))}
      noValidate
      className="flex max-w-2xl flex-col gap-8"
    >
      <FormAlert message={errors.root?.server?.message} />

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 text-lg font-semibold">Thông tin game</legend>
        <TextField label="Tên game" error={errors.title?.message} {...register('title')} />
        <GameCategoriesField register={register} errors={errors} />
        <TextField
          label="Số người chơi"
          placeholder="1-2P"
          className="max-w-40"
          error={errors.players?.message}
          {...register('players')}
        />
        <TextAreaField
          label="Mô tả"
          error={errors.description?.message}
          {...register('description')}
        />
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 text-lg font-semibold">Hình ảnh</legend>
        <TextField
          label="Link ảnh poster"
          type="url"
          placeholder="Trống: hiện tên game bằng chữ"
          error={errors.posterUrl?.message}
          {...register('posterUrl')}
        />
        <AccentColorField registration={register('accentColor')} />
      </fieldset>

      <GameBranchesField register={register} errors={errors} allBranches={allBranches} />

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 text-lg font-semibold">Hiển thị</legend>
        <TextField
          label="Thứ tự (nhỏ hiện trước)"
          inputMode="numeric"
          className="max-w-32"
          error={errors.sortOrder?.message}
          {...register('sortOrder')}
        />
        <CheckboxField
          label="Đang hoạt động"
          hint="Bỏ chọn để ẩn game khỏi trang khách mà không xóa"
          {...register('isActive')}
        />
      </fieldset>

      <div className="flex items-center gap-3">
        <Button type="submit" loading={pending} disabled={!isDirty}>
          {submitLabel}
        </Button>
        <Link to="/admin/games" className="text-sm text-neutral-400 hover:text-neutral-200">
          Quay lại danh sách
        </Link>
      </div>
    </form>
  )
}
