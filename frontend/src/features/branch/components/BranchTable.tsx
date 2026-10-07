import { Link } from 'react-router'

import { Button } from '@/shared/components/ui/Button'

import type { Branch } from '../types/branch.types'

interface BranchTableProps {
  branches: Branch[]
  onDelete: (branch: Branch) => void
}

/** Bảng chi nhánh ở trang quản trị (gồm cả chi nhánh đang ẩn) */
export function BranchTable({ branches, onDelete }: BranchTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-800">
      <table className="w-full text-left text-sm">
        <thead className="bg-neutral-900 text-neutral-400">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">
              Chi nhánh
            </th>
            <th scope="col" className="px-4 py-3 text-center font-medium">
              PS5
            </th>
            <th scope="col" className="px-4 py-3 text-center font-medium">
              VIP
            </th>
            <th scope="col" className="px-4 py-3 text-center font-medium">
              Phòng PC
            </th>
            <th scope="col" className="px-4 py-3 text-center font-medium">
              Thứ tự
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Trạng thái
            </th>
            <th scope="col" className="px-4 py-3">
              <span className="sr-only">Thao tác</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800">
          {branches.map((branch) => (
            <tr key={branch.id} className={branch.isActive ? '' : 'text-neutral-500'}>
              <td className="px-4 py-3">
                <p className="font-semibold text-neutral-100">{branch.name}</p>
                <p className="text-xs text-neutral-500">{branch.address}</p>
              </td>
              <td className="px-4 py-3 text-center">{branch.ps5Count}</td>
              <td className="px-4 py-3 text-center">{branch.vipRoomCount}</td>
              <td className="px-4 py-3 text-center">{branch.pcRoomCount || '—'}</td>
              <td className="px-4 py-3 text-center">{branch.sortOrder}</td>
              <td className="px-4 py-3">
                {branch.isActive ? (
                  <span className="text-green-400">Đang hoạt động</span>
                ) : (
                  <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-xs">Đang ẩn</span>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Link
                    to={`/admin/branches/${branch.id}/edit`}
                    className="rounded-lg px-3 py-1.5 font-semibold text-brand-400 hover:bg-neutral-800"
                  >
                    Sửa
                  </Link>
                  <Button
                    variant="ghost"
                    className="px-3 py-1.5 text-red-400 hover:text-red-300"
                    onClick={() => onDelete(branch)}
                  >
                    Xóa
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
