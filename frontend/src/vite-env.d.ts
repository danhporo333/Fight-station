/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL gốc của API, ví dụ `/api/v1` (dev, qua proxy) hoặc `https://api.fightstation.vn/api/v1` */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
