import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'

import { FormAlert } from '@/shared/components/ui/FormAlert'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'
import { getErrorMessage } from '@/shared/utils/error-messages'

import { PricePlanForm } from '../components/PricePlanForm'
import { usePricePlan } from '../hooks/usePricePlan'
import { useUpdatePricePlan } from '../hooks/useUpdatePricePlan'
import { applyPricePlanErrors } from '../utils/price-plan-form-errors'
import { toPricePlanFormValues, toPricePlanPayload } from '../utils/price-plan.utils'

export function AdminPricePlanEditPage() {
  useDocumentTitle('Sửa gói giá')
  const navigate = useNavigate()
  const id = Number(useParams().id)
  const { data: plan, isPending, error } = usePricePlan(id, true)
  const updatePlan = useUpdatePricePlan()

  if (!(id > 0) || error) {
    return (
      <div className="flex flex-col items-start gap-3">
        <FormAlert message={error ? getErrorMessage(error) : 'Đường dẫn không hợp lệ'} />
        <Link to="/admin/price-plans" className="text-sm text-brand-400 hover:underline">
          Về danh sách gói
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Sửa gói giá{plan ? `: ${plan.name}` : ''}</h1>
      {isPending ? (
        <div
          aria-hidden="true"
          className="h-96 max-w-2xl animate-pulse rounded-xl bg-neutral-900"
        />
      ) : (
        <PricePlanForm
          key={plan.updatedAt}
          defaultValues={toPricePlanFormValues(plan)}
          submitLabel="Lưu thay đổi"
          pending={updatePlan.isPending}
          onSubmit={(values, setError) =>
            updatePlan.mutate(
              { id, payload: toPricePlanPayload(values) },
              {
                onSuccess: ({ data }) => {
                  toast.success(`Đã lưu gói ${data.name}`)
                  void navigate('/admin/price-plans')
                },
                onError: (err) => applyPricePlanErrors(err, setError),
              },
            )
          }
        />
      )}
    </div>
  )
}
