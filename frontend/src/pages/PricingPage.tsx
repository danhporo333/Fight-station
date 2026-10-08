import { useSearchParams } from 'react-router'

import { BRANCH_SEARCH_PARAM, BranchPicker } from '@/features/branch'
import { PricePlanList } from '@/features/price-plan'
import { SectionHeading } from '@/shared/components/ui/SectionHeading'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'

/** Đọc số nguyên dương từ tham số URL; sai hoặc trống → undefined (xem tất cả chi nhánh) */
function readBranchId(value: string | null): number | undefined {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : undefined
}

/**
 * Trang /pricing. Ghép branch + price-plan qua URL: BranchPicker ghi `?branch=`, trang đọc rồi truyền
 * vào PricePlanList. Chọn chi nhánh thì hiện gói riêng của chi nhánh đó và các gói chung; chi nhánh
 * chưa có bảng giá thì báo liên hệ. Không chọn: hiện mọi gói, mỗi thẻ ghi rõ chi nhánh áp dụng.
 */
export function PricingPage() {
  useDocumentTitle('Bảng giá')
  const branchId = readBranchId(useSearchParams()[0].get(BRANCH_SEARCH_PARAM))

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
      <SectionHeading as="h1" tag="Pricing" title="Bảng giá" accent="Giờ chơi">
        Chọn chi nhánh để xem bảng giá và dịch vụ của chi nhánh đó.
      </SectionHeading>
      <div className="mb-8 flex justify-center">
        <BranchPicker />
      </div>
      <PricePlanList
        headingLevel="h2"
        branchId={branchId}
        emptyMessage={
          branchId
            ? 'Chi nhánh này chưa có bảng giá riêng. Vui lòng liên hệ chi nhánh để được báo giá.'
            : 'Bảng giá đang được cập nhật.'
        }
      />
    </section>
  )
}
