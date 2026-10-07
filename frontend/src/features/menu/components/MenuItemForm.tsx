import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type UseFormSetError } from 'react-hook-form'
import { Link } from 'react-router'

import { Button } from '@/shared/components/ui/Button'
import { CheckboxField } from '@/shared/components/ui/CheckboxField'
import { FormAlert } from '@/shared/components/ui/FormAlert'
import { SelectField } from '@/shared/components/ui/SelectField'
import { TextField } from '@/shared/components/ui/TextField'

import { useMenuCategories } from '../hooks/useMenuCategories'
import { menuItemFormSchema, type MenuItemFormInput } from '../types/menu.schema'

interface MenuItemFormProps {
  defaultValues: MenuItemFormInput
  submitLabel: string
  pending: boolean
  /** Trang cha gọi mutation; lỗi server gán lại vào form qua `setError` */
  onSubmit: (values: MenuItemFormInput, setError: UseFormSetError<MenuItemFormInput>) => void
}

/** Form thêm/sửa món (Admin). Ô chọn nhóm liệt kê cả nhóm đang ẩn (ghi "đang ẩn"). */
export function MenuItemForm({ defaultValues, submitLabel, pending, onSubmit }: MenuItemFormProps) {
  const { data: categories } = useMenuCategories({ includeInactive: true })
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm<MenuItemFormInput>({ resolver: zodResolver(menuItemFormSchema), defaultValues })

  const categoryOptions = (categories ?? []).map((category) => ({
    value: String(category.id),
    label: category.isActive ? category.name : `${category.name} (đang ẩn)`,
  }))

  return (
    <form
      onSubmit={handleSubmit((values) => onSubmit(values, setError))}
      noValidate
      className="flex max-w-2xl flex-col gap-8"
    >
      <FormAlert message={errors.root?.server?.message} />

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 text-lg font-semibold">Thông tin món</legend>
        {/* key: khi danh sách nhóm tải xong, select vẽ lại để chọn đúng giá trị mặc định */}
        <SelectField
          key={categoryOptions.length}
          label="Nhóm menu"
          placeholder="Chọn nhóm…"
          options={categoryOptions}
          className="max-w-xs"
          error={errors.menuCategoryId?.message}
          {...register('menuCategoryId')}
        />
        <TextField label="Tên món" error={errors.name?.message} {...register('name')} />
        <TextField
          label="Mô tả ngắn"
          placeholder="Vd: 3 cây, hoặc các vị: Dâu / Xoài / Đào"
          error={errors.description?.message}
          {...register('description')}
        />
        <TextField
          label="Giá (đồng)"
          inputMode="numeric"
          placeholder="25000"
          className="max-w-40"
          error={errors.priceVnd?.message}
          {...register('priceVnd')}
        />
        <TextField
          label="Link ảnh"
          type="url"
          placeholder="Trống: món chỉ hiện chữ"
          error={errors.imageUrl?.message}
          {...register('imageUrl')}
        />
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 text-lg font-semibold">Hiển thị</legend>
        <CheckboxField
          label="Còn hàng"
          hint="Bỏ chọn khi tạm hết: món vẫn hiện trên web nhưng mờ đi, ghi “Tạm hết”"
          {...register('isAvailable')}
        />
        <CheckboxField
          label="Bán chạy"
          hint="Hiện huy hiệu “Best seller” cạnh tên món trên trang khách"
          {...register('isBestSeller')}
        />
        <TextField
          label="Thứ tự trong nhóm (nhỏ hiện trước)"
          inputMode="numeric"
          className="max-w-32"
          error={errors.sortOrder?.message}
          {...register('sortOrder')}
        />
        <CheckboxField
          label="Đang hoạt động"
          hint="Bỏ chọn để ẩn món khỏi trang khách mà không xóa"
          {...register('isActive')}
        />
      </fieldset>

      <div className="flex items-center gap-3">
        <Button type="submit" loading={pending} disabled={!isDirty}>
          {submitLabel}
        </Button>
        <Link to="/admin/menu" className="text-sm text-neutral-400 hover:text-neutral-200">
          Quay lại danh sách
        </Link>
      </div>
    </form>
  )
}
