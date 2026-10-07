// Kiểu bám theo API_SPEC.md mục 4 (định dạng response)

export interface Meta {
  page: number
  limit: number
  total: number
  totalPages: number
}

/** Kết quả service trả về sau khi http.ts bóc envelope `{ success, data, meta }` */
export interface ApiResult<T> {
  data: T
  meta?: Meta
}

/** Danh sách có phân trang */
export interface Paged<T> {
  data: T[]
  meta: Meta
}

export interface ApiErrorDetail {
  field: string
  message: string
}

export interface ApiErrorBody {
  success: false
  error: {
    code: string
    message: string
    details?: ApiErrorDetail[]
  }
}

export interface ApiSuccessBody<T> {
  success: true
  data: T
  meta?: Meta
}
