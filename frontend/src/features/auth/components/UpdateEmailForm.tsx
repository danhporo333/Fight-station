import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/Button'
import { FormAlert } from '@/shared/components/ui/FormAlert'
import { TextField } from '@/shared/components/ui/TextField'
import { applyServerErrors } from '@/shared/utils/form-errors'

import { useCurrentAdmin } from '../hooks/useCurrentAdmin'
import { useUpdateEmail } from '../hooks/useUpdateEmail'
import { updateEmailSchema, type UpdateEmailInput } from '../types/auth.schema'

/** Email dùng để nhận link đặt lại mật khẩu. Để trống rồi lưu = xoá email. */
export function UpdateEmailForm() {
  const { data } = useCurrentAdmin()
  const updateEmail = useUpdateEmail()
  const {
    register,
    handleSubmit,
    setError,
    resetField,
    formState: { errors },
  } = useForm<UpdateEmailInput>({
    resolver: zodResolver(updateEmailSchema),
    // values theo email hiện tại: tự điền khi /auth/me tải xong và sau khi lưu
    values: { email: data?.data.email ?? '', currentPassword: '' },
  })

  const onSubmit = handleSubmit((values) =>
    updateEmail.mutate(values, {
      onSuccess: () => {
        toast.success(values.email === '' ? 'Đã xoá email khôi phục' : 'Đã lưu email khôi phục')
        resetField('currentPassword')
      },
      onError: (error) => applyServerErrors(error, setError, ['email', 'currentPassword']),
    }),
  )

  return (
    <form onSubmit={onSubmit} noValidate className="flex max-w-md flex-col gap-4">
      <FormAlert message={errors.root?.server?.message} />
      <TextField
        label="Email khôi phục"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <TextField
        label="Mật khẩu hiện tại (để xác nhận)"
        type="password"
        autoComplete="current-password"
        error={errors.currentPassword?.message}
        {...register('currentPassword')}
      />
      <Button type="submit" loading={updateEmail.isPending} className="self-start">
        Lưu email
      </Button>
    </form>
  )
}
