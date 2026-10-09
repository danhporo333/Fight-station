import { Link } from 'react-router'

import { useBranches } from '../hooks/useBranches'

/**
 * Tên các chi nhánh đang hoạt động cho cột "Chi nhánh" ở footer (bấm → /branches). Dùng chung cache
 * với BranchList nên không gọi API thêm. Đang tải hoặc lỗi thì không hiện gì.
 */
export function BranchFooterList() {
  const { data: branches } = useBranches()
  if (!branches || branches.length === 0) return null

  return (
    <ul className="flex flex-col gap-0.5">
      {branches.map((branch) => (
        <li key={branch.id}>
          <Link
            to="/branches"
            className="inline-block py-1 text-muted transition-colors hover:text-brand-500"
          >
            {branch.name}
          </Link>
        </li>
      ))}
    </ul>
  )
}
