import { useNavigate } from 'react-router'
import { toast } from 'sonner'

import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'
import { applyServerErrors } from '@/shared/utils/form-errors'

import { BranchForm } from '../components/BranchForm'
import { useCreateBranch } from '../hooks/useCreateBranch'
import { BRANCH_FORM_FIELDS } from '../types/branch.schema'
import { EMPTY_BRANCH_FORM, toBranchPayload } from '../utils/branch.utils'

export function AdminBranchNewPage() {
  useDocumentTitle('Thêm chi nhánh')
  const navigate = useNavigate()
  const createBranch = useCreateBranch()

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Thêm chi nhánh</h1>
      <BranchForm
        defaultValues={EMPTY_BRANCH_FORM}
        submitLabel="Thêm chi nhánh"
        pending={createBranch.isPending}
        onSubmit={(values, setError) =>
          createBranch.mutate(toBranchPayload(values), {
            onSuccess: ({ data }) => {
              toast.success(`Đã thêm chi nhánh ${data.name}`)
              void navigate('/admin/branches')
            },
            onError: (error) => applyServerErrors(error, setError, BRANCH_FORM_FIELDS),
          })
        }
      />
    </div>
  )
}
