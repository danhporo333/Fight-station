import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorFallbackProps {
  onRetry?: () => void
}

/** Màn hình khi có lỗi bất ngờ, thay cho màn hình trắng */
export function ErrorFallback({ onRetry }: ErrorFallbackProps) {
  return (
    <div
      role="alert"
      className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center"
    >
      <h1 className="text-2xl font-bold text-brand-500">Đã có lỗi xảy ra</h1>
      <p className="text-neutral-400">Bạn thử tải lại trang nhé.</p>
      <button
        type="button"
        onClick={onRetry ?? (() => window.location.reload())}
        className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-500"
      >
        Tải lại
      </button>
    </div>
  )
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

// React chỉ hỗ trợ bắt lỗi render bằng class component
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Chưa có dịch vụ thu lỗi; ghi ra console để còn tra khi dev
    console.error('ErrorBoundary', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? <ErrorFallback onRetry={() => this.setState({ hasError: false })} />
      )
    }
    return this.props.children
  }
}
