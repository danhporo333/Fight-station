import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/Button'
import { TextField } from '@/shared/components/ui/TextField'
import { applyServerErrors } from '@/shared/utils/form-errors'

import { useChangePassword } from '../hooks/useChangePassword'
import { changePasswordSchema, type ChangePasswordInput } from '../types/auth.schema'
import { FormAlert } from './FormAlert'

const EMPTY: ChangePasswordInput = { currentPassword: '', newPassword: '', confirmPassword: '' }

export function ChangePasswordForm() {
  const changePassword = useChangePassword()
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: EMPTY,
  })

  const onSubmit = handleSubmit((values) =>
    changePassword.mutate(values, {
      onSuccess: () => {
        toast.success('Đã đổi mật khẩu')
        reset(EMPTY)
      },
      // Sai mật khẩu hiện tại: API trả COMMON_001 với details field `currentPassword`
      onError: (error) => applyServerErrors(error, setError, ['currentPassword', 'newPassword']),
    }),
  )

  return (
    <form onSubmit={onSubmit} noValidate className="flex max-w-md flex-col gap-4">
      <FormAlert message={errors.root?.server?.message} />
      <TextField
        label="Mật khẩu hiện tại"
        type="password"
        autoComplete="current-password"
        error={errors.currentPassword?.message}
        {...register('currentPassword')}
      />
      <TextField
        label="Mật khẩu mới (ít nhất 8 ký tự)"
        type="password"
        autoComplete="new-password"
        error={errors.newPassword?.message}
        {...register('newPassword')}
      />
      <TextField
        label="Nhập lại mật khẩu mới"
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />
      <Button type="submit" loading={changePassword.isPending} className="self-start">
        Đổi mật khẩu
      </Button>
    </form>
  )
}
