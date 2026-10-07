import type { BranchFormInput } from '../types/branch.schema'
import type { Branch, BranchPayload } from '../types/branch.types'

/** Tên tham số URL chứa chi nhánh đang chọn (BranchPicker ghi, trang ghép như GamesPage đọc) */
export const BRANCH_SEARCH_PARAM = 'branch'

/** Số điện thoại chỉ còn chữ số và dấu + ("0901 234 567" → "0901234567") */
function digitsOnly(phone: string): string {
  return phone.replace(/[^\d+]/g, '')
}

export function telHref(phone: string): string {
  return `tel:${digitsOnly(phone)}`
}

/** mapUrl trống → tìm trên Google Maps theo địa chỉ */
export function mapHref(branch: Pick<Branch, 'mapUrl' | 'address'>): string {
  return (
    branch.mapUrl ??
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.address)}`
  )
}

/** zaloUrl trống → tạo từ số điện thoại; không có cả hai thì không có link */
export function zaloHref(branch: Pick<Branch, 'zaloUrl' | 'phone'>): string | null {
  if (branch.zaloUrl) return branch.zaloUrl
  return branch.phone ? `https://zalo.me/${digitsOnly(branch.phone)}` : null
}

export const EMPTY_BRANCH_FORM: BranchFormInput = {
  name: '',
  address: '',
  phone: '',
  openHours: '',
  ps5Count: '0',
  vipRoomCount: '0',
  pcRoomCount: '0',
  areaM2: '',
  mapUrl: '',
  facebookUrl: '',
  zaloUrl: '',
  sortOrder: '0',
  isActive: true,
}

/** Chi nhánh từ API → giá trị form (null → '', số → chuỗi) */
export function toBranchFormValues(branch: Branch): BranchFormInput {
  return {
    name: branch.name,
    address: branch.address,
    phone: branch.phone ?? '',
    openHours: branch.openHours ?? '',
    ps5Count: String(branch.ps5Count),
    vipRoomCount: String(branch.vipRoomCount),
    pcRoomCount: String(branch.pcRoomCount),
    areaM2: branch.areaM2 === null ? '' : String(branch.areaM2),
    mapUrl: branch.mapUrl ?? '',
    facebookUrl: branch.facebookUrl ?? '',
    zaloUrl: branch.zaloUrl ?? '',
    sortOrder: String(branch.sortOrder),
    isActive: branch.isActive,
  }
}

const emptyToNull = (value: string): string | null => (value === '' ? null : value)

/** Giá trị form → body POST/PUT (ô trống → null, ô số → number) */
export function toBranchPayload(values: BranchFormInput): BranchPayload {
  return {
    name: values.name,
    address: values.address,
    phone: emptyToNull(values.phone),
    openHours: emptyToNull(values.openHours),
    ps5Count: Number(values.ps5Count),
    vipRoomCount: Number(values.vipRoomCount),
    pcRoomCount: Number(values.pcRoomCount),
    areaM2: values.areaM2 === '' ? null : Number(values.areaM2),
    mapUrl: emptyToNull(values.mapUrl),
    facebookUrl: emptyToNull(values.facebookUrl),
    zaloUrl: emptyToNull(values.zaloUrl),
    sortOrder: Number(values.sortOrder),
    isActive: values.isActive,
  }
}
