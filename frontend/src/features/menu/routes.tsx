import type { RouteObject } from 'react-router'

/** Gắn vào `children` của PublicLayout. Tải lazy. */
export const menuPublicRoutes: RouteObject[] = [
  {
    path: 'menu',
    lazy: async () => ({ Component: (await import('./pages/MenuPage')).MenuPage }),
  },
]

/** Gắn dưới nhánh `admin` (đã bọc RequireAuth); mọi admin (owner, staff) đều vào được. Tải lazy. */
export const menuAdminRoutes: RouteObject[] = [
  {
    path: 'menu',
    lazy: async () => ({ Component: (await import('./pages/AdminMenuPage')).AdminMenuPage }),
  },
  {
    path: 'menu/new',
    lazy: async () => ({
      Component: (await import('./pages/AdminMenuItemNewPage')).AdminMenuItemNewPage,
    }),
  },
  {
    path: 'menu/:id/edit',
    lazy: async () => ({
      Component: (await import('./pages/AdminMenuItemEditPage')).AdminMenuItemEditPage,
    }),
  },
  {
    path: 'menu-categories',
    lazy: async () => ({
      Component: (await import('./pages/AdminMenuCategoriesPage')).AdminMenuCategoriesPage,
    }),
  },
]
