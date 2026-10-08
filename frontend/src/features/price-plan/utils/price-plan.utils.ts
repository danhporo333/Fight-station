import type { PricePlanFormInput } from '../types/price-plan.schema'
import type { PricePlan, PricePlanFeature, PricePlanPayload } from '../types/price-plan.types'

/** Lưới thẻ gói giá, dùng chung cho danh sách và khung chờ để hai bên khớp bố cục */
export const PRICE_PLAN_GRID_CLASS = 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3'

/** Dòng quyền lợi dạng combo: "Combo sáng (8h30–13h): 199K" */
const COMBO_LINE = /^(.+?):\s*(\d+(?:[.,]\d+)?)K$/i

export interface PricePlanCombo {
  label: string
  /** Giữ đúng như chủ quán gõ, vd "199K" */
  price: string
}

export interface PricePlanLines {
  /** Các combo kèm giá, vẽ thành bảng giá nhỏ */
  combos: PricePlanCombo[]
  /** Dịch vụ trong phòng (dòng không có đuôi ": <số>K") */
  perks: string[]
}

/**
 * Tách danh sách quyền lợi thành combo và dịch vụ trong phòng. API chỉ có một mảng chuỗi nên quy ước:
 * dòng kết thúc bằng ": <số>K" là combo, các dòng còn lại là dịch vụ. Giữ nguyên thứ tự API trả về.
 */
export function splitPricePlanLines(features: PricePlanFeature[]): PricePlanLines {
  const combos: PricePlanCombo[] = []
  const perks: string[] = []
  for (const { content } of features) {
    const match = COMBO_LINE.exec(content.trim())
    if (match?.[1] && match[2]) combos.push({ label: match[1].trim(), price: `${match[2]}K` })
    else perks.push(content)
  }
  return { combos, perks }
}

/** Gói mới: đơn vị mặc định "/giờ" như API, chưa có quyền lợi nào */
export const EMPTY_PRICE_PLAN_FORM: PricePlanFormInput = {
  name: '',
  priceVnd: '',
  unit: '/giờ',
  description: '',
  isHot: false,
  allBranches: true,
  branchIds: [],
  sortOrder: '0',
  isActive: true,
  features: [],
}

/** Gói từ API → giá trị form (null → '', số → chuỗi, quyền lợi → `{ content }`) */
export function toPricePlanFormValues(plan: PricePlan): PricePlanFormInput {
  return {
    name: plan.name,
    priceVnd: String(plan.priceVnd),
    unit: plan.unit,
    description: plan.description ?? '',
    isHot: plan.isHot,
    allBranches: plan.branches.length === 0,
    branchIds: plan.branches.map((branch) => String(branch.id)),
    sortOrder: String(plan.sortOrder),
    isActive: plan.isActive,
    features: plan.features.map((feature) => ({ content: feature.content })),
  }
}

/** Giá trị form → body POST/PUT (ô trống → null, chuỗi số → số, thứ tự mảng = thứ tự hiển thị) */
export function toPricePlanPayload(values: PricePlanFormInput): PricePlanPayload {
  return {
    name: values.name,
    priceVnd: Number(values.priceVnd),
    unit: values.unit,
    description: values.description === '' ? null : values.description,
    isHot: values.isHot,
    branchIds: values.allBranches ? null : values.branchIds.map(Number),
    sortOrder: Number(values.sortOrder),
    isActive: values.isActive,
    features: values.features.map((feature) => feature.content),
  }
}
