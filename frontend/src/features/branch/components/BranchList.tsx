import { Button } from '@/shared/components/ui/Button'
import { getErrorMessage } from '@/shared/utils/error-messages'

import { useBranches } from '../hooks/useBranches'
import { BranchCard } from './BranchCard'

// Ảnh mẫu: 4 thẻ một hàng trên màn hình lớn, tự xuống hàng khi hẹp
const GRID_CLASS = 'grid gap-6 sm:grid-cols-2 xl:grid-cols-4'

export interface BranchListProps {
  /** Facebook của quán, dùng cho chi nhánh để trống facebookUrl (trang ghép truyền vào từ shop) */
  fallbackFacebookUrl?: string | null
}

/** Lưới chi nhánh đang hoạt động, đủ 3 trạng thái: đang tải, lỗi, rỗng */
export function BranchList({ fallbackFacebookUrl }: BranchListProps) {
  const { data: branches, isPending, error, refetch } = useBranches()

  if (isPending) {
    return (
      <div aria-hidden="true" className={GRID_CLASS}>
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="h-[30rem] animate-pulse border border-brand-500/10 bg-card" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <p role="alert" className="text-sm text-red-400">
          {getErrorMessage(error)}
        </p>
        <Button variant="secondary" onClick={() => void refetch()}>
          Thử lại
        </Button>
      </div>
    )
  }

  if (branches.length === 0) {
    return <p className="text-center text-muted">Chưa có chi nhánh nào.</p>
  }

  return (
    <div className={GRID_CLASS}>
      {branches.map((branch, index) => (
        <BranchCard
          key={branch.id}
          branch={branch}
          index={index + 1}
          fallbackFacebookUrl={fallbackFacebookUrl}
        />
      ))}
    </div>
  )
}
