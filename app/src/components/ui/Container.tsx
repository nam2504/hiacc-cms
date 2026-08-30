import type { ElementType, ReactNode } from 'react'
import styles from './Container.module.css'

/**
 * Khung giới hạn bề ngang + padding hai bên. Mọi khối nội dung bọc bằng cái này
 * để lề trái/phải thẳng hàng nhau trên toàn site.
 */
export function Container({
  children,
  narrow = false,
  as: Tag = 'div',
  className = '',
}: {
  children: ReactNode
  /** Bề ngang hẹp (~800px) cho nội dung dạng bài đọc */
  narrow?: boolean
  as?: ElementType
  className?: string
}) {
  return (
    <Tag className={`${styles.container} ${narrow ? styles.narrow : ''} ${className}`}>
      {children}
    </Tag>
  )
}
