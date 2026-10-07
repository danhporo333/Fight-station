import { useBranches } from './useBranches'

/**
 * Tóm tắt hệ thống chi nhánh cho trang ghép (vd số liệu hero trang chủ): số chi nhánh đang hoạt động
 * và tổng máy PS5. Dùng chung cache với BranchList nên không gọi API thêm. Chưa có dữ liệu → undefined.
 */
export function useBranchSummary(): { count: number; ps5Total: number } | undefined {
  const { data: branches } = useBranches()
  if (!branches) return undefined
  return {
    count: branches.length,
    ps5Total: branches.reduce((total, branch) => total + branch.ps5Count, 0),
  }
}
