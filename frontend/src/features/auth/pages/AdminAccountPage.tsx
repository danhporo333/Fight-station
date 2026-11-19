import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'

import { AccountInfo } from '../components/AccountInfo'
import { ChangePasswordForm } from '../components/ChangePasswordForm'
import { UpdateEmailForm } from '../components/UpdateEmailForm'

export function AdminAccountPage() {
  useDocumentTitle('Tài khoản')

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Tài khoản</h1>
        <AccountInfo />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Email khôi phục mật khẩu</h2>
        <p className="max-w-md text-sm text-neutral-400">
          Link đặt lại mật khẩu sẽ được gửi tới email này khi bạn quên mật khẩu.
        </p>
        <UpdateEmailForm />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Đổi mật khẩu</h2>
        <ChangePasswordForm />
      </section>
    </div>
  )
}
