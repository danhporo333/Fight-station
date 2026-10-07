import { Link } from 'react-router'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/Button'

import { useUpdateMenuCategory } from '../hooks/useUpdateMenuCategory'
import type { MenuCategory } from '../types/menu.types'
import { applyMenuCategoryErrors } from '../utils/menu-form-errors'
import {
  MENU_SEARCH_PARAMS,
  toMenuCategoryFormValues,
  toMenuCategoryPayload,
} from '../utils/menu.utils'
import { MenuCategoryForm } from './MenuCategoryForm'

interface MenuCategoryRowProps {
  category: MenuCategory
  editing: boolean
  onEdit: () => void
  onDone: () => void
  onDelete: (category: MenuCategory) => void
}

/** Một nhóm trong trang quản trị: hiển thị, hoặc form sửa ngay tại chỗ khi `editing` */
export function MenuCategoryRow({
  category,
  editing,
  onEdit,
  onDone,
  onDelete,
}: MenuCategoryRowProps) {
  const updateCategory = useUpdateMenuCategory()

  if (editing) {
    return (
      <li className="bg-neutral-900/60 px-4 py-4">
        <MenuCategoryForm
          defaultValues={toMenuCategoryFormValues(category)}
          submitLabel="Lưu"
          pending={updateCategory.isPending}
          onCancel={onDone}
          onSubmit={(values, { setError }) =>
            updateCategory.mutate(
              { id: category.id, payload: toMenuCategoryPayload(values) },
              {
                onSuccess: () => {
                  toast.success(`Đã lưu nhóm ${values.name}`)
                  onDone()
                },
                onError: (error) => applyMenuCategoryErrors(error, setError),
              },
            )
          }
        />
      </li>
    )
  }

  const hasItems = category.itemCount > 0

  return (
    <li
      className={`flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 text-sm ${category.isActive ? '' : 'text-neutral-500'}`}
    >
      <span className="min-w-40 flex-1 font-semibold text-neutral-100">{category.name}</span>
      {/* Bấm số món để xem các món của nhóm ở bảng món */}
      <Link
        to={`/admin/menu?${MENU_SEARCH_PARAMS.category}=${category.id}`}
        className="hover:text-brand-400 hover:underline"
      >
        {category.itemCount} món
      </Link>
      <span>Thứ tự {category.sortOrder}</span>
      {category.isActive ? (
        <span className="text-green-400">Đang hiện</span>
      ) : (
        <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-xs">
          Đang ẩn (mọi món trong nhóm ẩn theo)
        </span>
      )}
      <span className="flex gap-2">
        <Button variant="ghost" className="px-3 py-1.5 text-brand-400" onClick={onEdit}>
          Sửa
        </Button>
        <Button
          variant="ghost"
          className="px-3 py-1.5 text-red-400 hover:text-red-300"
          disabled={hasItems}
          title={hasItems ? `Còn ${category.itemCount} món, chuyển hoặc xóa món trước` : undefined}
          onClick={() => onDelete(category)}
        >
          Xóa
        </Button>
      </span>
    </li>
  )
}
