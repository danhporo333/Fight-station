import { createBrowserRouter, Navigate } from 'react-router'

import { authAdminRoutes, authPublicRoutes, RequireRole } from '@/features/auth'
import { BranchFooterList, branchOwnerRoutes } from '@/features/branch'
import { gameAdminRoutes } from '@/features/game'
import { menuAdminRoutes, menuPublicRoutes } from '@/features/menu'
import { ShopFooter, shopOwnerRoutes } from '@/features/shop'
import { HomePage } from '@/pages/HomePage'
import { ErrorFallback } from '@/shared/components/ErrorBoundary'
import { PublicLayout, type PublicNavItem } from '@/shared/components/layout/PublicLayout'
import { NotFoundPage } from '@/shared/components/NotFoundPage'

// Menu trang khách: mỗi feature có trang công khai thì thêm một dòng
const PUBLIC_NAV: PublicNavItem[] = [
  { to: '/', label: 'Trang chủ' },
  { to: '/games', label: 'Game' },
  { to: '/menu', label: 'Menu' },
  { to: '/branches', label: 'Chi nhánh' },
]

// Nút nổi bật bên phải header: khách muốn liên hệ thì xem chi nhánh (hotline, Facebook, Zalo)
const PUBLIC_CTA: PublicNavItem = { to: '/branches', label: 'Liên hệ' }

// Chỉ ghép route. Mỗi feature tự khai báo RouteObject[] trong features/[x]/routes.tsx rồi thêm vào đây.
export const router = createBrowserRouter([
  {
    element: (
      <PublicLayout
        navItems={PUBLIC_NAV}
        cta={PUBLIC_CTA}
        footer={<ShopFooter links={PUBLIC_NAV} branches={<BranchFooterList />} />}
      />
    ),
    errorElement: <ErrorFallback />,
    children: [
      { index: true, element: <HomePage /> },
      ...authPublicRoutes,
      // Trang ghép nhiều feature nằm ở src/pages
      {
        path: 'games',
        lazy: async () => ({ Component: (await import('@/pages/GamesPage')).GamesPage }),
      },
      {
        path: 'branches',
        lazy: async () => ({ Component: (await import('@/pages/BranchesPage')).BranchesPage }),
      },
      ...menuPublicRoutes,
      // ...publicRoutes của feature (pricing, promotions)
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
      ...gameAdminRoutes,
      ...menuAdminRoutes,
      // ...promotionRoutes (Admin)
      {
        // Trang chỉ owner: staff vào sẽ thấy "Không đủ quyền"
        element: <RequireRole role="owner" />,
        children: [
          ...shopOwnerRoutes,
          ...branchOwnerRoutes,
          // ...pricePlanOwnerRoutes
        ],
      },
    ],
  },
])
