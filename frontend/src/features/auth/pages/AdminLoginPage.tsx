import { Navigate, useNavigate, useSearchParams } from 'react-router'

import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'
import { useAuthStore } from '@/shared/stores/auth.store'

import { LoginForm } from '../components/LoginForm'
import { getSafeNextPath } from '../utils/auth.utils'

export function AdminLoginPage() {
  useDocumentTitle('Đăng nhập quản trị')
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const hasToken = useAuthStore((state) => state.accessToken !== null)
  const nextPath = getSafeNextPath(params.get('next'))

  // Đã đăng nhập rồi thì vào thẳng trang quản trị
  if (hasToken) return <Navigate to={nextPath} replace />

  return (
    <section className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-16">
      <div className="text-center">
        <h1 className="text-2xl font-black">
          Quản trị <span className="text-brand-500">Fight Station</span>
        </h1>
        <p className="mt-2 text-sm text-neutral-400">Dành cho chủ quán và nhân viên</p>
      </div>
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
        <LoginForm onSuccess={() => void navigate(nextPath, { replace: true })} />
      </div>
    </section>
  )
}
