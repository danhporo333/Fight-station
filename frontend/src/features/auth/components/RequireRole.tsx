import type { ReactNode } from 'react'
import { Link, Outlet } from 'react-router'

import { useHasRole } from '../hooks/useHasRole'
import type { AdminRole } from '../types/auth.types'
import { ROLE_LABEL } from '../utils/auth.utils'

export interface RequireRoleProps {
  role: AdminRole
  /** Không truyền thì render <Outlet /> (dùng làm element của nhóm route) */
  children?: ReactNode
}

/** Che trang không đúng role. Chỉ là giao diện: quyền thật do API kiểm tra (AUTH_005). */
export function RequireRole({ role, children }: RequireRoleProps) {
  const allowed = useHasRole(role)

  if (!allowed) {
    return (
      <section role="alert" className="mx-auto mt-16 max-w-md text-center">
        <p className="text-5xl font-black text-brand-500">403</p>
        <h1 className="mt-3 text-xl font-bold">Không đủ quyền</h1>
        <p className="mt-2 text-neutral-400">
          Trang này chỉ dành cho {ROLE_LABEL[role].toLowerCase()}.
        </p>
        <Link to="/admin" className="mt-6 inline-block text-brand-400 hover:underline">
          Về trang quản trị
        </Link>
      </section>
    )
  }
  return children ?? <Outlet />
}
