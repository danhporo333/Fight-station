import type { RouteObject } from 'react-router'

// Tải lazy: trang Admin* vào chunk `admin` (vite.config.ts), khách không phải tải

/** Gắn vào PublicLayout (không cần đăng nhập) */
export const authPublicRoutes: RouteObject[] = [
  {
    path: 'admin/login',
    lazy: async () => ({ Component: (await import('./pages/AdminLoginPage')).AdminLoginPage }),
  },
]

/** Gắn dưới nhánh `admin` (đã bọc RequireAuth); mọi admin (owner, staff) đều vào được */
export const authAdminRoutes: RouteObject[] = [
  {
    path: 'account',
    lazy: async () => ({ Component: (await import('./pages/AdminAccountPage')).AdminAccountPage }),
  },
]
