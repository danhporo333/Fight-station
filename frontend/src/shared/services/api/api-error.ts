import type { ApiErrorDetail } from '@/shared/types/api.types'

/** Mã lỗi phía client (không đến từ server) */
export const NETWORK_ERROR = 'NETWORK_ERROR'

/** Mọi lỗi gọi API đều là ApiError. Giao diện dựa vào `code`, không dựa vào `message`. */
export class ApiError extends Error {
  readonly code: string
  readonly status?: number
  readonly details?: ApiErrorDetail[]

  constructor(code: string, message: string, details?: ApiErrorDetail[], status?: number) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.details = details
    this.status = status
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}
