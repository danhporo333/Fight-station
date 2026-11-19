import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/shared/components/ui/Button'
import { FormAlert } from '@/shared/components/ui/FormAlert'
import { TextField } from '@/shared/components/ui/TextField'
import { applyServerErrors } from '@/shared/utils/form-errors'

import { useResetPassword } from '../hooks/useResetPassword'
import { resetPasswordSchema, type ResetPasswordInput } from '../types/auth.schema'

export interface ResetPasswordFormProps {
  /** Token lấy từ link trong email */
  token: string
  /** Gọi sau khi đặt lại thành công */
  onSuccess: () => void
}

export function ResetPasswordForm({ token, onSuccess }: ResetPasswordFormProps) {
  const resetPassword = useResetPassword()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  })

  const onSubmit = handleSubmit(({ newPassword }) =>
    resetPassword.mutate(
      { token, newPassword },
      {
        onSuccess,
        // Token sai/hết hạn (AUTH_006) hiện ở FormAlert; lỗi độ dài mật khẩu gắn vào ô newPassword
        onError: (error) => applyServerErrors(error, setError, ['newPassword']),
      },
    ),
  )

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <FormAlert message={errors.root?.server?.message} />
      <TextField
        label="Mật khẩu mới (ít nhất 8 ký tự)"
        type="password"
        autoComplete="new-password"
        autoFocus
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
      <Button type="submit" loading={resetPassword.isPending} className="mt-2">
        Đặt mật khẩu mới
      </Button>
    </form>
  )
}
