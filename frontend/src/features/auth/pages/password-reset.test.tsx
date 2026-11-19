import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'

import { authPublicRoutes } from '../routes'
import { resetPasswordSchema } from '../types/auth.schema'

function renderAt(path: string) {
  const router = createMemoryRouter(authPublicRoutes, { initialEntries: [path] })
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('đặt lại mật khẩu', () => {
  it('báo link không hợp lệ khi thiếu token', async () => {
    renderAt('/admin/reset-password')
    expect(await screen.findByRole('alert')).toHaveTextContent('Link không hợp lệ')
  })

  it('hiện form đặt mật khẩu khi có token và bắt lỗi nhập lại không khớp', async () => {
    renderAt('/admin/reset-password?token=abc')
    await userEvent.type(await screen.findByLabelText(/Mật khẩu mới/), 'matkhau-moi-456')
    await userEvent.type(screen.getByLabelText('Nhập lại mật khẩu mới'), 'khac-hoan-toan')
    await userEvent.click(screen.getByRole('button', { name: 'Đặt mật khẩu mới' }))
    expect(await screen.findByText('Mật khẩu nhập lại không khớp')).toBeInTheDocument()
  })

  it('trang quên mật khẩu yêu cầu nhập tên đăng nhập hoặc email', async () => {
    renderAt('/admin/forgot-password')
    await userEvent.click(await screen.findByRole('button', { name: 'Gửi link đặt lại mật khẩu' }))
    expect(await screen.findByText('Nhập tên đăng nhập hoặc email')).toBeInTheDocument()
  })

  it('schema từ chối mật khẩu ngắn', () => {
    const result = resetPasswordSchema.safeParse({ newPassword: 'ngan', confirmPassword: 'ngan' })
    expect(result.success).toBe(false)
  })
})
