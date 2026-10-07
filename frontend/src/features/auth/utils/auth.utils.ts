import type { AdminRole } from '../types/auth.types'

const DEFAULT_ADMIN_PATH = '/admin'

/**
 * Đường dẫn quay lại sau khi đăng nhập (`?next=`). Chỉ nhận đường dẫn nội bộ bắt đầu bằng một `/`
 * (chặn `//evil.com`, `/\evil.com`, `https://...`) để không bị chuyển hướng sang trang lạ.
 */
export function getSafeNextPath(next: string | null): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) {
    return DEFAULT_ADMIN_PATH
  }
  if (next.startsWith('/admin/login')) return DEFAULT_ADMIN_PATH
  return next
}

export const ROLE_LABEL: Record<AdminRole, string> = {
  owner: 'Chủ quán',
  staff: 'Nhân viên',
}
