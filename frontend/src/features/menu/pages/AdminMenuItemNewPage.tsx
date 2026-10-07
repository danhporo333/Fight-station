import { useNavigate, useSearchParams } from 'react-router'
import { toast } from 'sonner'

import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'

import { MenuItemForm } from '../components/MenuItemForm'
import { useCreateMenuItem } from '../hooks/useCreateMenuItem'
import { applyMenuItemErrors } from '../utils/menu-form-errors'
import {
  emptyMenuItemForm,
  MENU_SEARCH_PARAMS,
  readIdParam,
  toMenuItemPayload,
} from '../utils/menu.utils'

export function AdminMenuItemNewPage() {
  useDocumentTitle('Thêm món')
  const navigate = useNavigate()
  const createItem = useCreateMenuItem()
  // Mở từ bảng món đang lọc theo nhóm (?category=) thì chọn sẵn nhóm đó
  const categoryId = readIdParam(useSearchParams()[0].get(MENU_SEARCH_PARAMS.category))

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Thêm món</h1>
      <MenuItemForm
        defaultValues={emptyMenuItemForm(categoryId ? String(categoryId) : '')}
        submitLabel="Thêm món"
        pending={createItem.isPending}
        onSubmit={(values, setError) =>
          createItem.mutate(toMenuItemPayload(values), {
            onSuccess: ({ data }) => {
              toast.success(`Đã thêm món ${data.name}`)
              void navigate(`/admin/menu?${MENU_SEARCH_PARAMS.category}=${data.category.id}`)
            },
            onError: (error) => applyMenuItemErrors(error, setError),
          })
        }
      />
    </div>
  )
}
