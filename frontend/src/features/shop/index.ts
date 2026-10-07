// Public API của feature shop
export { ShopFooter } from './components/ShopFooter'
export { ShopHero, type HeroStat } from './components/ShopHero'
// Trang ghép (src/pages) đọc thông tin quán, vd Facebook dự phòng cho thẻ chi nhánh
export { useShop } from './hooks/useShop'
export { shopOwnerRoutes } from './routes'
export type { Shop } from './types/shop.types'
