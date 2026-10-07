import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'

import { FormAlert } from '@/shared/components/ui/FormAlert'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'
import { getErrorMessage } from '@/shared/utils/error-messages'
import { applyServerErrors } from '@/shared/utils/form-errors'

import { BranchForm } from '../components/BranchForm'
import { useBranch } from '../hooks/useBranch'
import { useUpdateBranch } from '../hooks/useUpdateBranch'
import { BRANCH_FORM_FIELDS } from '../types/branch.schema'
import { toBranchFormValues, toBranchPayload } from '../utils/branch.utils'

export function AdminBranchEditPage() {
  useDocumentTitle('Sửa chi nhánh')
  const navigate = useNavigate()
  const id = Number(useParams().id)
  const { data: branch, isPending, error } = useBranch(id, true)
  const updateBranch = useUpdateBranch()

  if (!(id > 0) || error) {
    return (
      <div className="flex flex-col items-start gap-3">
        <FormAlert message={error ? getErrorMessage(error) : 'Đường dẫn không hợp lệ'} />
        <Link to="/admin/branches" className="text-sm text-brand-400 hover:underline">
          Về danh sách chi nhánh
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Sửa chi nhánh{branch ? `: ${branch.name}` : ''}</h1>
      {isPending ? (
        <div
          aria-hidden="true"
          className="h-96 max-w-2xl animate-pulse rounded-xl bg-neutral-900"
        />
      ) : (
        <BranchForm
          key={branch.updatedAt}
          defaultValues={toBranchFormValues(branch)}
          submitLabel="Lưu thay đổi"
          pending={updateBranch.isPending}
          onSubmit={(values, setError) =>
            updateBranch.mutate(
              { id, payload: toBranchPayload(values) },
              {
                onSuccess: ({ data }) => {
                  toast.success(`Đã lưu chi nhánh ${data.name}`)
                  void navigate('/admin/branches')
                },
                onError: (err) => applyServerErrors(err, setError, BRANCH_FORM_FIELDS),
              },
            )
          }
        />
      )}
    </div>
  )
}
