import { useEffect } from 'react'

const SITE_NAME = 'Fight Station'

/** Đặt tiêu đề tab trình duyệt: "Menu | Fight Station". Không truyền title thì chỉ hiện tên quán. */
export function useDocumentTitle(title?: string): void {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE_NAME}` : SITE_NAME
  }, [title])
}
