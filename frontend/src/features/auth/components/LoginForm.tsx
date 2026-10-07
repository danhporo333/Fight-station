import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/shared/components/ui/Button'
import { TextField } from '@/shared/components/ui/TextField'
import { applyServerErrors } from '@/shared/utils/form-errors'

import { useLogin } from '../hooks/useLogin'
import { loginSchema, type LoginInput } from '../types/auth.schema'
import { FormAlert } from './FormAlert'

export interface LoginFormProps {
  /** Gọi sau khi đăng nhập thành công (phiên đã lưu vào auth.store) */
  onSuccess: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const login = useLogin()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  })

  const onSubmit = handleSubmit((values) =>
    login.mutate(values, {
      onSuccess,
      onError: (error) => applyServerErrors(error, setError, ['username', 'password']),
    }),
  )

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <FormAlert message={errors.root?.server?.message} />
      <TextField
        label="Tên đăng nhập"
        autoComplete="username"
        autoFocus
        error={errors.username?.message}
        {...register('username')}
      />
      <TextField
        label="Mật khẩu"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />
      <Button type="submit" loading={login.isPending} className="mt-2">
        Đăng nhập
      </Button>
    </form>
  )
}
