/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'

import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] }), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    // Dev: gọi /api/... qua proxy tới backend để khỏi lỗi CORS. Cổng phải trùng PORT trong backend/.env
    proxy: {
      '/api': { target: 'http://localhost:8000', changeOrigin: true },
    },
  },
  build: {
    rolldownOptions: {
      output: {
        // Thư viện bên ngoài → `vendor`. Mã quản trị KHÔNG gom bằng manualChunks (Rolldown kéo luôn code
        // dùng chung vào chunk đó, trang công khai lại phải tải); nhánh /admin và mọi trang Admin* tải
        // lazy (app/routes.tsx, features/*/routes.tsx) nên tự tách chunk riêng.
        manualChunks: (id) => (id.includes('node_modules') ? 'vendor' : undefined),
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
})
