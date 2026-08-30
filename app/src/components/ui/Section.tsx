import type { ReactNode } from 'react'
import { Container } from './Container'
import styles from './Section.module.css'

/**
 * Một dải nội dung theo chiều dọc: nền + khoảng cách trên dưới + tiêu đề tuỳ chọn.
 * Trang chủ (W1) ghép các khối AUDIT §3 bằng component này để nhịp dọc đều nhau.
 */
export function Section({
  children,
  title,
  subtitle,
  tone = 'default',
  narrow = false,
  id,
}: {
  children: ReactNode
  title?: string
  subtitle?: string
  /** default = nền trắng · soft = nền xám nhạt · brand = nền đỏ chữ trắng · dark = nền xanh đen */
  tone?: 'default' | 'soft' | 'brand' | 'dark'
  narrow?: boolean
  id?: string
}) {
  return (
    <section id={id} className={`${styles.section} ${styles[tone]}`}>
      <Container narrow={narrow}>
        {(title || subtitle) && (
          <header className={styles.header}>
            {title && <h2 className={styles.title}>{title}</h2>}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </header>
        )}
        {children}
      </Container>
    </section>
  )
}
