// Event bus nhỏ cho thông báo một chiều giữa các phần tách rời (FE-ARCHITECTURE.md mục 5)

/** Bản đồ tên sự kiện → payload. Thêm sự kiện mới ở đây. */
export interface AppEvents {
  /** http.ts phát khi API trả AUTH_002/AUTH_003 (token sai hoặc hết hạn) */
  'auth:expired': undefined
}

type EventName = keyof AppEvents
type Listener<K extends EventName> = (payload: AppEvents[K]) => void

const listeners = new Map<EventName, Set<Listener<EventName>>>()

export const eventBus = {
  /** Đăng ký lắng nghe, trả về hàm hủy (dùng làm cleanup của useEffect) */
  on<K extends EventName>(event: K, listener: Listener<K>): () => void {
    const set = listeners.get(event) ?? new Set()
    set.add(listener as Listener<EventName>)
    listeners.set(event, set)
    return () => {
      set.delete(listener as Listener<EventName>)
    }
  },

  emit<K extends EventName>(
    event: K,
    ...[payload]: AppEvents[K] extends undefined ? [] : [AppEvents[K]]
  ): void {
    listeners.get(event)?.forEach((listener) => listener(payload as AppEvents[EventName]))
  },
}
