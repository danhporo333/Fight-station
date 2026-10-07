import axios, { type AxiosRequestConfig } from 'axios'

import { useAuthStore } from '@/shared/stores/auth.store'
import type { ApiErrorBody, ApiResult, ApiSuccessBody } from '@/shared/types/api.types'
import { eventBus } from '@/shared/utils/event-bus'

import { ApiError, NETWORK_ERROR } from './api-error'

const AUTH_EXPIRED_CODES = new Set(['AUTH_002', 'AUTH_003'])

// Axios instance DUY NHẤT của app. Service của feature chỉ gọi qua `http`, không import axios.
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
})

client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError<ApiErrorBody>(error) && error.response?.data?.error) {
      const { status, data } = error.response
      const { code, message, details } = data.error
      if (AUTH_EXPIRED_CODES.has(code)) eventBus.emit('auth:expired')
      throw new ApiError(code, message, details, status)
    }
    throw new ApiError(NETWORK_ERROR, 'Không kết nối được máy chủ, vui lòng thử lại')
  },
)

async function request<T>(config: AxiosRequestConfig): Promise<ApiResult<T>> {
  const response = await client.request<ApiSuccessBody<T>>(config)
  // 204 (DELETE) không có body
  if (response.status === 204 || !response.data) return { data: undefined as T }
  return { data: response.data.data, meta: response.data.meta }
}

/** Gọi API, trả `{ data, meta }` đã bóc envelope; lỗi luôn là ApiError */
export const http = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: 'GET', url }),
  post: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: 'POST', url, data: body }),
  put: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: 'PUT', url, data: body }),
  delete: <T = void>(url: string, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: 'DELETE', url }),
}
