import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState, type ReactNode } from 'react'
import { Toaster, toast } from 'sonner'

import { ErrorBoundary } from '@/shared/components/ErrorBoundary'
import { isApiError } from '@/shared/services/api'
import { useAuthStore } from '@/shared/stores/auth.store'
import { eventBus } from '@/shared/utils/event-bus'

import { router } from './routes'

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Khớp Cache-Control: max-age=60 của backend
        staleTime: 60_000,
        // Lỗi 4xx (sai dữ liệu, không tìm thấy, hết quyền) thử lại cũng vô ích
        retry: (failureCount, error) => {
          if (isApiError(error) && error.status && error.status < 500) return false
          return failureCount < 2
        },
      },
    },
  })
}

interface AppProvidersProps {
  children: ReactNode
}

/** Thứ tự từ ngoài vào: ErrorBoundary → QueryClientProvider → Toaster → (RouterProvider ở App.tsx) */
export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(createQueryClient)

  // Token sai/hết hạn (AUTH_002/003): xóa phiên, xóa cache, về trang đăng nhập kèm ?next=
  useEffect(
    () =>
      eventBus.on('auth:expired', () => {
        useAuthStore.getState().clearSession()
        queryClient.clear()
        toast.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại')
        const { pathname, search } = window.location
        if (pathname !== '/admin/login') {
          void router.navigate(`/admin/login?next=${encodeURIComponent(pathname + search)}`)
        }
      }),
    [queryClient],
  )

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster position="top-right" richColors theme="dark" />
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
