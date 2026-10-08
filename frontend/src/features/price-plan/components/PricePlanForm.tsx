import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch, type UseFormSetError } from 'react-hook-form'
import { Link } from 'react-router'

import { Button } from '@/shared/components/ui/Button'
import { CheckboxField } from '@/shared/components/ui/CheckboxField'
import { FormAlert } from '@/shared/components/ui/FormAlert'
import { TextField } from '@/shared/components/ui/TextField'

import { pricePlanFormSchema, type PricePlanFormInput } from '../types/price-plan.schema'
import { PricePlanBranchesField } from './PricePlanBranchesField'
import { PricePlanFeaturesField } from './PricePlanFeaturesField'

interface PricePlanFormProps {
  defaultValues: PricePlanFormInput
  submitLabel: string
  pending: boolean
  /** Trang cha gọi mutation; lỗi server gán lại vào form qua `setError` */
  onSubmit: (values: PricePlanFormInput, setError: UseFormSetError<PricePlanFormInput>) => void
}

/** Form thêm/sửa gói giá (Owner), gồm danh sách quyền lợi thêm/xóa/đổi chỗ được */
export function PricePlanForm({
  defaultValues,
  submitLabel,
  pending,
  onSubmit,
}: PricePlanFormProps) {
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm<PricePlanFormInput>({ resolver: zodResolver(pricePlanFormSchema), defaultValues })
  const allBranches = useWatch({ control, name: 'allBranches' })

  return (
    <form
      onSubmit={handleSubmit((values) => onSubmit(values, setError))}
      noValidate
      className="flex max-w-2xl flex-col gap-8"
    >
      <FormAlert message={errors.root?.server?.message} />

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 text-lg font-semibold">Thông tin gói</legend>
        <TextField label="Tên gói" error={errors.name?.message} {...register('name')} />
        <div className="flex flex-wrap gap-4">
          <TextField
            label="Giá (đồng)"
            inputMode="numeric"
            placeholder="15000"
            className="max-w-40"
            error={errors.priceVnd?.message}
            {...register('priceVnd')}
          />
          <TextField
            label="Đơn vị"
            placeholder="/giờ"
            className="max-w-32"
            error={errors.unit?.message}
            {...register('unit')}
          />
        </div>
        <TextField
          label="Nhãn phía trên giá"
          placeholder="Vd: Giờ lẻ"
          error={errors.description?.message}
          {...register('description')}
        />
      </fieldset>

      <PricePlanBranchesField register={register} errors={errors} allBranches={allBranches} />

      <PricePlanFeaturesField control={control} register={register} errors={errors} />

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 text-lg font-semibold">Hiển thị</legend>
        <CheckboxField
          label="Gói nổi bật (HOT)"
          hint="Thẻ có viền sáng và nhãn HOT trên trang khách"
          {...register('isHot')}
        />
        <TextField
          label="Thứ tự (nhỏ hiện trước)"
          inputMode="numeric"
          className="max-w-32"
          error={errors.sortOrder?.message}
          {...register('sortOrder')}
        />
        <CheckboxField
          label="Đang hoạt động"
          hint="Bỏ chọn để ẩn gói khỏi trang khách mà không xóa"
          {...register('isActive')}
        />
      </fieldset>

      <div className="flex items-center gap-3">
        <Button type="submit" loading={pending} disabled={!isDirty}>
          {submitLabel}
        </Button>
        <Link to="/admin/price-plans" className="text-sm text-neutral-400 hover:text-neutral-200">
          Quay lại danh sách
        </Link>
      </div>
    </form>
  )
}
