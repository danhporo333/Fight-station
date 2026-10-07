import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/Button'
import { FormAlert } from '@/shared/components/ui/FormAlert'
import { TextAreaField } from '@/shared/components/ui/TextAreaField'
import { TextField } from '@/shared/components/ui/TextField'
import { applyServerErrors } from '@/shared/utils/form-errors'

import { useUpdateShop } from '../hooks/useUpdateShop'
import { SHOP_FORM_FIELDS, shopFormSchema, type ShopFormInput } from '../types/shop.schema'
import type { Shop } from '../types/shop.types'
import { SOCIAL_KEYS, socialLabel, toShopFormValues, toShopPayload } from '../utils/shop.utils'

interface ShopFormProps {
  shop: Shop
}

/** Form sửa thông tin quán (Owner). Ô trống được gửi là null (xóa giá trị). */
export function ShopForm({ shop }: ShopFormProps) {
  const updateShop = useUpdateShop()
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isDirty },
  } = useForm<ShopFormInput>({
    resolver: zodResolver(shopFormSchema),
    defaultValues: toShopFormValues(shop),
  })

  const onSubmit = handleSubmit((values) =>
    updateShop.mutate(toShopPayload(values), {
      onSuccess: ({ data }) => {
        toast.success('Đã lưu thông tin quán')
        reset(toShopFormValues(data))
      },
      onError: (error) => applyServerErrors(error, setError, SHOP_FORM_FIELDS),
    }),
  )

  return (
    <form onSubmit={onSubmit} noValidate className="flex max-w-2xl flex-col gap-8">
      <FormAlert message={errors.root?.server?.message} />

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 text-lg font-semibold">Thông tin chung</legend>
        <TextField label="Tên quán" error={errors.name?.message} {...register('name')} />
        <TextAreaField
          label="Giới thiệu ngắn (tagline)"
          error={errors.tagline?.message}
          {...register('tagline')}
        />
        <TextField
          label="Giờ mở cửa"
          placeholder="24/7"
          error={errors.hoursLabel?.message}
          {...register('hoursLabel')}
        />
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 text-lg font-semibold">Liên hệ</legend>
        <TextField
          label="Hotline"
          type="tel"
          placeholder="0901 234 567"
          error={errors.hotline?.message}
          {...register('hotline')}
        />
        <TextField
          label="Email"
          type="email"
          error={errors.email?.message}
          {...register('email')}
        />
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 text-lg font-semibold">Mạng xã hội</legend>
        {SOCIAL_KEYS.map((key) => (
          <TextField
            key={key}
            label={socialLabel(key)}
            type="url"
            placeholder="https://..."
            error={errors[key]?.message}
            {...register(key)}
          />
        ))}
      </fieldset>

      <div className="flex items-center gap-3">
        <Button type="submit" loading={updateShop.isPending} disabled={!isDirty}>
          Lưu thay đổi
        </Button>
        <Button variant="ghost" disabled={!isDirty || updateShop.isPending} onClick={() => reset()}>
          Hoàn tác
        </Button>
      </div>
    </form>
  )
}
