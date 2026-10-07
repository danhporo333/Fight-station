import { ShopHero } from '@/features/shop'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'

/** Trang chủ. Sau này ghép thêm GameList, PricePlanList, MenuList, BranchList... từ các feature. */
export function HomePage() {
  useDocumentTitle()

  return <ShopHero />
}
