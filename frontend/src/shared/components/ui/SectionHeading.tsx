import type { ReactNode } from 'react'

export interface SectionHeadingProps {
  /** Nhãn nhỏ phía trên, hiện dạng "// LOCATIONS" */
  tag: string
  /** Phần đầu tiêu đề (chữ sáng) */
  title: string
  /** Phần cuối tiêu đề (chữ cam phát sáng), vd "Chi nhánh" */
  accent?: string
  children?: ReactNode
  /** h1 cho tiêu đề chính của trang, h2 cho một mục trong trang */
  as?: 'h1' | 'h2'
}

/** Tiêu đề mục kiểu neon: nhãn mono, tiêu đề in hoa có phần nhấn cam, dòng mô tả (children) */
export function SectionHeading({
  tag,
  title,
  accent,
  children,
  as: Heading = 'h2',
}: SectionHeadingProps) {
  return (
    <header className="mb-12 flex flex-col items-center gap-4 text-center">
      <p className="font-mono text-xs tracking-[0.3em] text-neon-red uppercase">
        <span className="opacity-60">// </span>
        {tag}
      </p>
      <Heading className="text-4xl leading-tight font-bold uppercase sm:text-5xl lg:text-6xl">
        {title}
        {accent && <span className="text-glow text-brand-500"> {accent}</span>}
      </Heading>
      {children && <p className="max-w-xl text-base text-muted sm:text-lg">{children}</p>}
    </header>
  )
}
