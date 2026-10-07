import type { RouteObject } from 'react-router'

/** Gắn dưới nhánh `admin` trong nhóm RequireRole owner; tải lazy để khách không tải mã quản trị */
export const shopOwnerRoutes: RouteObject[] = [
  {
    path: 'shop',
    lazy: async () => ({ Component: (await import('./pages/AdminShopPage')).AdminShopPage }),
  },
]
