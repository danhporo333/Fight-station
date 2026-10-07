import type { RouteObject } from 'react-router'

// Trang công khai /games ghép thêm branch (BranchPicker) nên nằm ở src/pages/GamesPage.tsx,
// khai báo route trong app/routes.tsx.

/** Gắn dưới nhánh `admin` (đã bọc RequireAuth); mọi admin (owner, staff) đều vào được. Tải lazy. */
export const gameAdminRoutes: RouteObject[] = [
  {
    path: 'games',
    lazy: async () => ({ Component: (await import('./pages/AdminGamesPage')).AdminGamesPage }),
  },
  {
    path: 'games/new',
    lazy: async () => ({ Component: (await import('./pages/AdminGameNewPage')).AdminGameNewPage }),
  },
  {
    path: 'games/:id/edit',
    lazy: async () => ({
      Component: (await import('./pages/AdminGameEditPage')).AdminGameEditPage,
    }),
  },
  {
    path: 'game-categories',
    lazy: async () => ({
      Component: (await import('./pages/AdminGameCategoriesPage')).AdminGameCategoriesPage,
    }),
  },
]
