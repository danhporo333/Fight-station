import { ChevronDown, ChevronUp, Plus, X } from 'lucide-react'
import {
  useFieldArray,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from 'react-hook-form'

import { Button } from '@/shared/components/ui/Button'
import { TextField } from '@/shared/components/ui/TextField'

import { MAX_PRICE_PLAN_FEATURES, type PricePlanFormInput } from '../types/price-plan.schema'

interface PricePlanFeaturesFieldProps {
  control: Control<PricePlanFormInput>
  register: UseFormRegister<PricePlanFormInput>
  errors: FieldErrors<PricePlanFormInput>
}

const ICON_BUTTON_CLASS = 'px-2 py-2'

/**
 * Danh sách quyền lợi của gói: thêm, xóa, đổi chỗ lên/xuống. Thứ tự trong danh sách chính là thứ tự
 * hiển thị trên trang khách (API lấy thứ tự theo vị trí trong mảng gửi lên).
 */
export function PricePlanFeaturesField({ control, register, errors }: PricePlanFeaturesFieldProps) {
  const { fields, append, remove, move } = useFieldArray({ control, name: 'features' })

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-2 text-lg font-semibold">Combo và dịch vụ trong phòng</legend>
      <p className="text-sm text-neutral-500">
        Dòng có dạng <strong>Tên combo: 199K</strong> (kết thúc bằng dấu hai chấm, số và chữ K) sẽ
        hiện trong bảng giá combo. Dòng khác (vd “Điều hòa”, “TV 65 inch”) hiện ở mục “Trong phòng”.
      </p>
      {fields.length === 0 && (
        <p className="text-sm text-neutral-500">Chưa có dòng nào (không bắt buộc).</p>
      )}

      {fields.map((field, index) => (
        // key phải là id do useFieldArray sinh, không dùng index (đổi chỗ thì ô giữ đúng nội dung)
        <div key={field.id} className="flex items-start gap-2">
          <div className="flex-1">
            <TextField
              label={`Dòng ${index + 1}`}
              placeholder="Vd: Combo 3H (tự chọn): 199K, hoặc Điều hòa"
              error={errors.features?.[index]?.content?.message}
              {...register(`features.${index}.content`)}
            />
          </div>
          <div className="mt-7 flex gap-1">
            <Button
              variant="ghost"
              className={ICON_BUTTON_CLASS}
              disabled={index === 0}
              aria-label={`Đưa quyền lợi ${index + 1} lên trên`}
              onClick={() => move(index, index - 1)}
            >
              <ChevronUp aria-hidden="true" className="size-4" />
            </Button>
            <Button
              variant="ghost"
              className={ICON_BUTTON_CLASS}
              disabled={index === fields.length - 1}
              aria-label={`Đưa quyền lợi ${index + 1} xuống dưới`}
              onClick={() => move(index, index + 1)}
            >
              <ChevronDown aria-hidden="true" className="size-4" />
            </Button>
            <Button
              variant="ghost"
              className={`${ICON_BUTTON_CLASS} text-red-400 hover:text-red-300`}
              aria-label={`Xóa quyền lợi ${index + 1}`}
              onClick={() => remove(index)}
            >
              <X aria-hidden="true" className="size-4" />
            </Button>
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          disabled={fields.length >= MAX_PRICE_PLAN_FEATURES}
          onClick={() => append({ content: '' })}
        >
          <Plus aria-hidden="true" className="size-4" />
          Thêm dòng
        </Button>
        <span className="text-xs text-neutral-500">
          {fields.length}/{MAX_PRICE_PLAN_FEATURES}
        </span>
      </div>
    </fieldset>
  )
}
