import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'

import { HomePage } from '@/pages/HomePage'
import { PublicLayout } from '@/shared/components/layout/PublicLayout'
import { NotFoundPage } from '@/shared/components/NotFoundPage'

function renderAt(path: string) {
  const router = createMemoryRouter(
    [
      {
        element: <PublicLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
    { initialEntries: [path] },
  )
  // HomePage → ShopHero dùng React Query; không thử lại để test không chờ API thật
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('routes', () => {
  it('hiện trang chủ ở /', () => {
    renderAt('/')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Fight Station')
  })

  it('hiện NotFoundPage khi route không tồn tại', () => {
    renderAt('/khong-co')
    expect(screen.getByRole('heading', { name: 'Không tìm thấy trang' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Về trang chủ' })).toHaveAttribute('href', '/')
  })
})
