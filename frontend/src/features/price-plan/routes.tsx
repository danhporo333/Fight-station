import type { RouteObject } from 'react-router'

/** Gắn dưới nhánh `admin`, bên trong `RequireRole role="owner"` (chỉ owner được sửa giá). Tải lazy. */
export const pricePlanOwnerRoutes: RouteObject[] = [
  {
    path: 'price-plans',
    lazy: async () => ({
      Component: (await import('./pages/AdminPricePlansPage')).AdminPricePlansPage,
    }),
  },
  {
    path: 'price-plans/new',
    lazy: async () => ({
      Component: (await import('./pages/AdminPricePlanNewPage')).AdminPricePlanNewPage,
    }),
  },
  {
    path: 'price-plans/:id/edit',
    lazy: async () => ({
      Component: (await import('./pages/AdminPricePlanEditPage')).AdminPricePlanEditPage,
    }),
  },
]
