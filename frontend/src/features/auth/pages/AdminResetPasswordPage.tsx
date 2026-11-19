import { Link, useNavigate, useSearchParams } from 'react-router'
import { toast } from 'sonner'

import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'

import { ResetPasswordForm } from '../components/ResetPasswordForm'

export function AdminResetPasswordPage() {
  useDocumentTitle('Đặt lại mật khẩu')
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token')

  return (
    <section className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-16">
      <div className="text-center">
        <h1 className="text-2xl font-black">Đặt lại mật khẩu</h1>
      </div>
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
        {token ? (
          <ResetPasswordForm
            token={token}
            onSuccess={() => {
              toast.success('Đã đặt lại mật khẩu, hãy đăng nhập bằng mật khẩu mới')
              void navigate('/admin/login', { replace: true })
            }}
          />
        ) : (
          <p role="alert" className="text-sm text-red-300">
            Link không hợp lệ. Hãy{' '}
            <Link to="/admin/forgot-password" className="underline">
              yêu cầu link mới
            </Link>
            .
          </p>
        )}
      </div>
      <Link to="/admin/login" className="text-center text-sm text-neutral-400 hover:text-white">
        Quay lại đăng nhập
      </Link>
    </section>
  )
}
