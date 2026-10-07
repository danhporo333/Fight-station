import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'

import { FormAlert } from '@/shared/components/ui/FormAlert'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'
import { getErrorMessage } from '@/shared/utils/error-messages'

import { MenuItemForm } from '../components/MenuItemForm'
import { useMenuItem } from '../hooks/useMenuItem'
import { useUpdateMenuItem } from '../hooks/useUpdateMenuItem'
import { applyMenuItemErrors } from '../utils/menu-form-errors'
import { toMenuItemFormValues, toMenuItemPayload } from '../utils/menu.utils'

export function AdminMenuItemEditPage() {
  useDocumentTitle('Sửa món')
  const navigate = useNavigate()
  const id = Number(useParams().id)
  const { data: item, isPending, error } = useMenuItem(id, true)
  const updateItem = useUpdateMenuItem()

  if (!(id > 0) || error) {
    return (
      <div className="flex flex-col items-start gap-3">
        <FormAlert message={error ? getErrorMessage(error) : 'Đường dẫn không hợp lệ'} />
        <Link to="/admin/menu" className="text-sm text-brand-400 hover:underline">
          Về danh sách món
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Sửa món{item ? `: ${item.name}` : ''}</h1>
      {isPending ? (
        <div
          aria-hidden="true"
          className="h-96 max-w-2xl animate-pulse rounded-xl bg-neutral-900"
        />
      ) : (
        <MenuItemForm
          key={item.updatedAt}
          defaultValues={toMenuItemFormValues(item)}
          submitLabel="Lưu thay đổi"
          pending={updateItem.isPending}
          onSubmit={(values, setError) =>
            updateItem.mutate(
              { id, payload: toMenuItemPayload(values) },
              {
                onSuccess: ({ data }) => {
                  toast.success(`Đã lưu món ${data.name}`)
                  void navigate('/admin/menu')
                },
                onError: (err) => applyMenuItemErrors(err, setError),
              },
            )
          }
        />
      )}
    </div>
  )
}
