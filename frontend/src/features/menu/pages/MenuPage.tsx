import { SectionHeading } from '@/shared/components/ui/SectionHeading'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'

import { MenuBoard } from '../components/MenuBoard'

/** Trang /menu: đồ ăn, nước uống theo nhóm (tab) */
export function MenuPage() {
  useDocumentTitle('Menu')

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
      <SectionHeading as="h1" tag="Food & Drinks" title="Ăn vặt" accent="Phủ phê">
        Chiến game càng mê!!! Gọi món ngay tại chỗ, nhân viên mang tới tận máy.
      </SectionHeading>
      <MenuBoard headingLevel="h2" />
    </section>
  )
}
