import type { RouteObject } from 'react-router'

// Trang công khai /branches ghép thêm shop (Facebook dự phòng) nên nằm ở src/pages/BranchesPage.tsx,
// khai báo route trong app/routes.tsx.

/** Gắn dưới nhánh `admin` trong nhóm RequireRole owner; tải lazy để khách không tải mã quản trị */
export const branchOwnerRoutes: RouteObject[] = [
  {
    path: 'branches',
    lazy: async () => ({
      Component: (await import('./pages/AdminBranchesPage')).AdminBranchesPage,
    }),
  },
  {
    path: 'branches/new',
    lazy: async () => ({
      Component: (await import('./pages/AdminBranchNewPage')).AdminBranchNewPage,
    }),
  },
  {
    path: 'branches/:id/edit',
    lazy: async () => ({
      Component: (await import('./pages/AdminBranchEditPage')).AdminBranchEditPage,
    }),
  },
]
