import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type UseFormSetError } from 'react-hook-form'
import { Link } from 'react-router'

import { Button } from '@/shared/components/ui/Button'
import { CheckboxField } from '@/shared/components/ui/CheckboxField'
import { FormAlert } from '@/shared/components/ui/FormAlert'
import { TextField } from '@/shared/components/ui/TextField'

import { branchFormSchema, type BranchFormInput } from '../types/branch.schema'

interface BranchFormProps {
  defaultValues: BranchFormInput
  submitLabel: string
  pending: boolean
  /** Trang cha gọi mutation; lỗi server gán lại vào form qua `setError` */
  onSubmit: (values: BranchFormInput, setError: UseFormSetError<BranchFormInput>) => void
}

/** Form thêm/sửa chi nhánh (Owner). Dùng chung cho trang thêm và trang sửa. */
export function BranchForm({ defaultValues, submitLabel, pending, onSubmit }: BranchFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm<BranchFormInput>({ resolver: zodResolver(branchFormSchema), defaultValues })

  return (
    <form
      onSubmit={handleSubmit((values) => onSubmit(values, setError))}
      noValidate
      className="flex max-w-2xl flex-col gap-8"
    >
      <FormAlert message={errors.root?.server?.message} />

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 text-lg font-semibold">Thông tin chung</legend>
        <TextField label="Tên chi nhánh" error={errors.name?.message} {...register('name')} />
        <TextField label="Địa chỉ" error={errors.address?.message} {...register('address')} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Số điện thoại"
            type="tel"
            error={errors.phone?.message}
            {...register('phone')}
          />
          <TextField
            label="Giờ mở cửa"
            placeholder="09:00 — 24:00"
            error={errors.openHours?.message}
            {...register('openHours')}
          />
        </div>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <legend className="mb-2 text-lg font-semibold">Quy mô</legend>
        <TextField
          label="Số máy PS5"
          inputMode="numeric"
          error={errors.ps5Count?.message}
          {...register('ps5Count')}
        />
        <TextField
          label="Số phòng VIP"
          inputMode="numeric"
          error={errors.vipRoomCount?.message}
          {...register('vipRoomCount')}
        />
        <TextField
          label="Số phòng PC"
          inputMode="numeric"
          error={errors.pcRoomCount?.message}
          {...register('pcRoomCount')}
        />
        <TextField
          label="Diện tích (m²)"
          inputMode="numeric"
          error={errors.areaM2?.message}
          {...register('areaM2')}
        />
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 text-lg font-semibold">Liên kết (để trống sẽ tự tạo)</legend>
        <TextField
          label="Link Google Maps"
          type="url"
          placeholder="Trống: tìm theo địa chỉ"
          error={errors.mapUrl?.message}
          {...register('mapUrl')}
        />
        <TextField
          label="Facebook"
          type="url"
          placeholder="Trống: ẩn nút Facebook"
          error={errors.facebookUrl?.message}
          {...register('facebookUrl')}
        />
        <TextField
          label="Zalo"
          type="url"
          placeholder="Trống: tạo từ số điện thoại"
          error={errors.zaloUrl?.message}
          {...register('zaloUrl')}
        />
      </fieldset>

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
          hint="Bỏ chọn để ẩn chi nhánh khỏi trang khách mà không xóa"
          {...register('isActive')}
        />
      </fieldset>

      <div className="flex items-center gap-3">
        <Button type="submit" loading={pending} disabled={!isDirty}>
          {submitLabel}
        </Button>
        <Link to="/admin/branches" className="text-sm text-neutral-400 hover:text-neutral-200">
          Quay lại danh sách
        </Link>
      </div>
    </form>
  )
}
