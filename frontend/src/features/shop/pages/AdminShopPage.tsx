import { Button } from '@/shared/components/ui/Button'
import { FormAlert } from '@/shared/components/ui/FormAlert'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'
import { isApiError } from '@/shared/services/api'
import { formatDate } from '@/shared/utils/format'
import { getErrorMessage } from '@/shared/utils/error-messages'

import { ShopForm } from '../components/ShopForm'
import { useShop } from '../hooks/useShop'

export function AdminShopPage() {
  useDocumentTitle('Thông tin quán')
  const { data: shop, isPending, error, refetch } = useShop()

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Thông tin quán</h1>
        <p className="text-sm text-neutral-400">
          Hiện ở trang chủ và chân trang.
          {shop &&
            ` Cập nhật lần cuối ${formatDate(shop.updatedAt, { hour: '2-digit', minute: '2-digit' })}.`}
        </p>
      </header>

      {isPending && (
        <div aria-hidden="true" className="flex max-w-2xl flex-col gap-4">
          {[1, 2, 3, 4].map((row) => (
            <div key={row} className="h-16 animate-pulse rounded-lg bg-neutral-800" />
          ))}
        </div>
      )}

      {error && (
        <div className="flex max-w-2xl flex-col items-start gap-3">
          <FormAlert
            message={
              isApiError(error) && error.code === 'SHOP_001'
                ? 'Chưa có dữ liệu quán. Hãy chạy `npx prisma db seed` trong thư mục backend.'
                : getErrorMessage(error)
            }
          />
          <Button variant="secondary" onClick={() => void refetch()}>
            Thử lại
          </Button>
        </div>
      )}

      {/* key: dữ liệu mới từ server (sau khi lưu) thì form khởi tạo lại giá trị */}
      {shop && <ShopForm key={shop.updatedAt} shop={shop} />}
    </div>
  )
}
