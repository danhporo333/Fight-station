import { createBrowserRouter, Navigate } from 'react-router'

import { authAdminRoutes, authPublicRoutes, RequireRole } from '@/features/auth'
import { HomePage } from '@/pages/HomePage'
import { ErrorFallback } from '@/shared/components/ErrorBoundary'
import { PublicLayout } from '@/shared/components/layout/PublicLayout'
import { NotFoundPage } from '@/shared/components/NotFoundPage'

// Chỉ ghép route. Mỗi feature tự khai báo RouteObject[] trong features/[x]/routes.tsx rồi thêm vào đây.
export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    errorElement: <ErrorFallback />,
    children: [
      { index: true, element: <HomePage /> },
      ...authPublicRoutes,
      // ...publicRoutes của feature (menu, pricing, branches, promotions)
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: 'admin',
    // AdminRoot bọc RequireAuth (chưa đăng nhập → /admin/login?next=...). Tải lazy: khách không tải khung admin
    lazy: async () => ({ Component: (await import('./AdminRoot')).AdminRoot }),
    errorElement: <ErrorFallback />,
    children: [
      // Chưa có trang tổng quan: tạm vào trang tài khoản
      { index: true, element: <Navigate to="account" replace /> },
      ...authAdminRoutes,
      // ...gameRoutes, menuRoutes, promotionRoutes (Admin)
      {
        // Trang chỉ owner: staff vào sẽ thấy "Không đủ quyền"
        element: <RequireRole role="owner" />,
        children: [
          // ...branchOwnerRoutes, pricePlanOwnerRoutes, shopOwnerRoutes
        ],
      },
    ],
  },
])
