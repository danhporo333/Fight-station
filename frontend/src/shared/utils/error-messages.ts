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

  SHOP_001: 'Chưa có dữ liệu quán',

  BRANCH_001: 'Không tìm thấy chi nhánh (có thể đã bị xóa)',

  GAME_001: 'Không tìm thấy game (có thể đã bị xóa)',
  GAME_002: 'Tên game đã tồn tại',
  GAME_003: 'Không tìm thấy thể loại (có thể đã bị xóa)',
  GAME_004: 'Tên thể loại đã tồn tại',
  GAME_005: 'Thể loại còn game, hãy chuyển hoặc xóa game trước',
  GAME_006: 'Có chi nhánh không còn tồn tại, hãy tải lại trang và chọn lại',
}

/** Thông báo cho người dùng từ một lỗi bất kỳ (thường là ApiError) */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) return ERROR_MESSAGES[error.code] ?? error.message
  return ERROR_MESSAGES.NETWORK_ERROR ?? 'Đã có lỗi xảy ra'
}
