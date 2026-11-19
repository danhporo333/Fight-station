import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/shared/components/ui/Button'
import { FormAlert } from '@/shared/components/ui/FormAlert'
import { TextField } from '@/shared/components/ui/TextField'
import { applyServerErrors } from '@/shared/utils/form-errors'

import { useForgotPassword } from '../hooks/useForgotPassword'
import { forgotPasswordSchema, type ForgotPasswordInput } from '../types/auth.schema'

export function ForgotPasswordForm() {
  const forgotPassword = useForgotPassword()
  const [sent, setSent] = useState(false)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { identifier: '' },
  })

  const onSubmit = handleSubmit((values) =>
    forgotPassword.mutate(values, {
      onSuccess: () => setSent(true),
      onError: (error) => applyServerErrors(error, setError, ['identifier']),
    }),
  )

  // Backend luôn trả thành công nên thông báo cũng phải trung tính, không lộ tài khoản có tồn tại không
  if (sent) {
    return (
      <p role="status" className="text-sm text-neutral-300">
        Nếu tài khoản có đăng ký email khôi phục, chúng tôi đã gửi link đặt lại mật khẩu tới email
        đó. Link có hiệu lực trong thời gian ngắn, hãy kiểm tra cả hộp thư rác.
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <FormAlert message={errors.root?.server?.message} />
      <TextField
        label="Tên đăng nhập hoặc email khôi phục"
        autoComplete="username"
        autoFocus
        error={errors.identifier?.message}
        {...register('identifier')}
      />
      <Button type="submit" loading={forgotPassword.isPending} className="mt-2">
        Gửi link đặt lại mật khẩu
      </Button>
    </form>
  )
}
