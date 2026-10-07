import { BranchList } from '@/features/branch'
import { useShop } from '@/features/shop'
import { SectionHeading } from '@/shared/components/ui/SectionHeading'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'

/** Trang /branches. Ghép branch + shop: chi nhánh trống Facebook thì dùng Facebook của quán. */
export function BranchesPage() {
  useDocumentTitle('Chi nhánh')
  const { data: shop } = useShop()

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
      <SectionHeading as="h1" tag="Locations" title="Hệ thống" accent="Chi nhánh">
        Muốn ghé chi nhánh nào, cứ nhắn Facebook hoặc Zalo của chi nhánh đó để được tư vấn.
      </SectionHeading>
      <BranchList fallbackFacebookUrl={shop?.facebookUrl} />
    </section>
  )
}
