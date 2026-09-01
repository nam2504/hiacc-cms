import Link from 'next/link'
import type { ReactNode } from 'react'
import styles from './Button.module.css'

type Variant = 'primary' | 'outline' | 'ghost' | 'invert'
type Size = 'md' | 'lg'

/**
 * Nút / link dạng nút. Có `href` thì render <Link>, không thì render <button>.
 * Cấm tự viết nút riêng ở W1–W8 — giữ một kiểu nút duy nhất trên toàn site.
 */
export function Button({
  children,
  href,
  variant = 'primary',
  size = 'md',
  type = 'button',
  external = false,
  className = '',
  ...rest
}: {
  children: ReactNode
  href?: string
  variant?: Variant
  size?: Size
  type?: 'button' | 'submit'
  external?: boolean
  className?: string
  disabled?: boolean
  onClick?: () => void
}) {
  const cls = `${styles.btn} ${styles[variant]} ${styles[size]} ${className}`

  if (href) {
    if (external) {
      return (
        <a className={cls} href={href} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      )
    }
    return (
      <Link className={cls} href={href}>
        {children}
      </Link>
    )
  }

  return (
    <button className={cls} type={type} {...rest}>
      {children}
    </button>
  )
}
