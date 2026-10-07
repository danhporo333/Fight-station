// Mã lỗi dạng [FEATURE]_[NUMBER] (API_SPEC.md mục 5). Mã của từng feature thêm khi làm feature đó.
export const ErrorCode = {
  VALIDATION_FAILED: 'COMMON_001',
  INVALID_JSON: 'COMMON_002',
  ROUTE_NOT_FOUND: 'COMMON_003',
  TOO_MANY_REQUESTS: 'COMMON_004',
  PAYLOAD_TOO_LARGE: 'COMMON_005',
  INTERNAL_ERROR: 'COMMON_500',

  // auth (API_SPEC.md mục 2)
  AUTH_INVALID_CREDENTIALS: 'AUTH_001',
  AUTH_INVALID_TOKEN: 'AUTH_002',
  AUTH_TOKEN_EXPIRED: 'AUTH_003',
  AUTH_ACCOUNT_LOCKED: 'AUTH_004',
  AUTH_FORBIDDEN: 'AUTH_005',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
