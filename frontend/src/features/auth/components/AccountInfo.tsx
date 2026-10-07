import { Button } from '@/shared/components/ui/Button'
import { formatDate } from '@/shared/utils/format'
import { getErrorMessage } from '@/shared/utils/error-messages'

import { useCurrentAdmin } from '../hooks/useCurrentAdmin'
import { ROLE_LABEL } from '../utils/auth.utils'

const DATE_TIME: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' }

/** Thông tin tài khoản đang đăng nhập, đủ 3 trạng thái: đang tải / lỗi / có dữ liệu */
export function AccountInfo() {
  const { data, isPending, error, refetch } = useCurrentAdmin()

  if (isPending) {
    return (
      <div aria-busy="true" aria-label="Đang tải" className="flex flex-col gap-3">
        {[0, 1, 2].map((row) => (
          <div key={row} className="h-5 w-64 animate-pulse rounded bg-neutral-800" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div role="alert" className="flex items-center gap-3 text-sm text-red-300">
        {getErrorMessage(error)}
        <Button variant="secondary" onClick={() => void refetch()}>
          Thử lại
        </Button>
      </div>
    )
  }

  const admin = data.data
  const rows: [string, string][] = [
    ['Tên đăng nhập', admin.username],
    ['Vai trò', ROLE_LABEL[admin.role]],
    [
      'Đăng nhập gần nhất',
      admin.lastLoginAt ? formatDate(admin.lastLoginAt, DATE_TIME) : 'Chưa có',
    ],
    ['Ngày tạo', formatDate(admin.createdAt)],
  ]

  return (
    <dl className="grid max-w-md grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
      {rows.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="text-neutral-400">{label}</dt>
          <dd className="font-medium">{value}</dd>
        </div>
      ))}
    </dl>
  )
}
