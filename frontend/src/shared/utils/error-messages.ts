import { isApiError } from '@/shared/services/api'

/**
 * Thông báo hiển thị theo mã lỗi API (API_SPEC.md mục 5). Giao diện dựa vào `code`, không dựa vào
 * `message` của server. Mỗi feature bổ sung mã của mình khi làm feature đó.
 */
export const ERROR_MESSAGES: Record<string, string> = {
  NETWORK_ERROR: 'Không kết nối được máy chủ, vui lòng thử lại',
  COMMON_001: 'Dữ liệu chưa hợp lệ, vui lòng kiểm tra lại',
  COMMON_004: 'Bạn thao tác quá nhiều lần, vui lòng thử lại sau ít phút',
  COMMON_500: 'Hệ thống đang gặp lỗi, vui lòng thử lại sau',

  AUTH_001: 'Tên đăng nhập hoặc mật khẩu không đúng',
  AUTH_002: 'Bạn cần đăng nhập',
  AUTH_003: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại',
  AUTH_004: 'Tài khoản đã bị khóa, liên hệ chủ quán',
  AUTH_005: 'Bạn không đủ quyền thực hiện thao tác này',
}

/** Thông báo cho người dùng từ một lỗi bất kỳ (thường là ApiError) */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) return ERROR_MESSAGES[error.code] ?? error.message
  return ERROR_MESSAGES.NETWORK_ERROR ?? 'Đã có lỗi xảy ra'
}
