import { useNavigate } from 'react-router'
import { toast } from 'sonner'

import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'

import { PricePlanForm } from '../components/PricePlanForm'
import { useCreatePricePlan } from '../hooks/useCreatePricePlan'
import { applyPricePlanErrors } from '../utils/price-plan-form-errors'
import { EMPTY_PRICE_PLAN_FORM, toPricePlanPayload } from '../utils/price-plan.utils'

export function AdminPricePlanNewPage() {
  useDocumentTitle('Thêm gói giá')
  const navigate = useNavigate()
  const createPlan = useCreatePricePlan()

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Thêm gói giá</h1>
      <PricePlanForm
        defaultValues={EMPTY_PRICE_PLAN_FORM}
        submitLabel="Thêm gói"
        pending={createPlan.isPending}
        onSubmit={(values, setError) =>
          createPlan.mutate(toPricePlanPayload(values), {
            onSuccess: ({ data }) => {
              toast.success(`Đã thêm gói ${data.name}`)
              void navigate('/admin/price-plans')
            },
            onError: (error) => applyPricePlanErrors(error, setError),
          })
        }
      />
    </div>
  )
}
