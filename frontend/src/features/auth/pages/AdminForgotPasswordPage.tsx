import { Link } from 'react-router'

import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'

import { ForgotPasswordForm } from '../components/ForgotPasswordForm'

export function AdminForgotPasswordPage() {
  useDocumentTitle('Quên mật khẩu')

  return (
    <section className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-16">
      <div className="text-center">
        <h1 className="text-2xl font-black">Quên mật khẩu</h1>
        <p className="mt-2 text-sm text-neutral-400">
          Nhập tên đăng nhập hoặc email khôi phục để nhận link đặt lại mật khẩu
        </p>
      </div>
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
        <ForgotPasswordForm />
      </div>
      <Link to="/admin/login" className="text-center text-sm text-neutral-400 hover:text-white">
        Quay lại đăng nhập
      </Link>
    </section>
  )
}
