import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'

import { AccountInfo } from '../components/AccountInfo'
import { ChangePasswordForm } from '../components/ChangePasswordForm'

export function AdminAccountPage() {
  useDocumentTitle('Tài khoản')

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Tài khoản</h1>
        <AccountInfo />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Đổi mật khẩu</h2>
        <ChangePasswordForm />
      </section>
    </div>
  )
}
