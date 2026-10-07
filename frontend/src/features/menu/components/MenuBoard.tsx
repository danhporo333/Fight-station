import { Button } from '@/shared/components/ui/Button'
import { getErrorMessage } from '@/shared/utils/error-messages'

import { useMenu } from '../hooks/useMenu'
import { MenuPriceRow } from './MenuPriceRow'

// Cột kiểu báo (CSS columns): các khối nhóm dài ngắn khác nhau tự xếp khít, không hở như lưới
const COLUMNS_CLASS = 'columns-1 gap-6 md:columns-2 lg:columns-3'
const BLOCK_CLASS = 'mb-6 break-inside-avoid border border-brand-500/20 bg-card/80 p-5'

export interface MenuBoardProps {
  /** Cấp tiêu đề của tên nhóm: h2 khi trang có h1 ngay trên (/menu), h3 khi nằm trong mục h2 (trang chủ) */
  headingLevel?: 'h2' | 'h3'
}

/**
 * Menu trang khách dạng bảng giá (giống tờ menu của quán): mọi nhóm hiện cùng lúc, mỗi nhóm một khối
 * có tiêu đề, mỗi món một dòng "Tên ···· 35K". Cả menu tải một lần (GET /menu).
 */
export function MenuBoard({ headingLevel: Heading = 'h3' }: MenuBoardProps) {
  const { data: sections, isPending, error, refetch } = useMenu()

  if (isPending) {
    return (
      <div aria-hidden="true" className={COLUMNS_CLASS}>
        {['h-64', 'h-48', 'h-80', 'h-56', 'h-72', 'h-44'].map((height) => (
          <div key={height} className={`${BLOCK_CLASS} ${height} animate-pulse`} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <p role="alert" className="text-sm text-red-400">
          {getErrorMessage(error)}
        </p>
        <Button variant="secondary" onClick={() => void refetch()}>
          Thử lại
        </Button>
      </div>
    )
  }

  if (sections.length === 0) {
    return <p className="text-center text-muted">Menu đang được cập nhật.</p>
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Nhảy nhanh tới nhóm (hữu ích trên điện thoại, nơi mọi nhóm xếp một cột dài); vuốt ngang nếu tràn */}
      <nav aria-label="Nhóm menu" className="-mx-4 overflow-x-auto px-4">
        <ul className="mx-auto flex w-max gap-2">
          {sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#menu-${section.id}`}
                className="block border border-brand-500/30 px-4 py-2 text-xs font-bold tracking-[0.1em] whitespace-nowrap text-muted uppercase transition hover:border-brand-500 hover:bg-brand-500 hover:text-void"
              >
                {section.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className={COLUMNS_CLASS}>
        {sections.map((section) => (
          <section
            key={section.id}
            id={`menu-${section.id}`}
            aria-labelledby={`menu-${section.id}-title`}
            // scroll-mt: chừa chỗ cho header dính trên cùng khi nhảy tới nhóm
            className={`${BLOCK_CLASS} scroll-mt-24`}
          >
            <Heading
              id={`menu-${section.id}-title`}
              className="mb-2 inline-block clip-skew bg-brand-500 px-5 py-1.5 text-sm font-bold tracking-[0.15em] text-void uppercase"
            >
              {section.name}
            </Heading>
            <ul>
              {section.items.map((item) => (
                <MenuPriceRow key={item.id} item={item} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
