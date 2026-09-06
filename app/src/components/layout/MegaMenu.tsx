'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { TreeNode } from '@/lib/serviceTree'
import { t } from '@/lib/i18n'
import styles from './MegaMenu.module.css'

/**
 * Menu chính: 5 nhóm dịch vụ sinh từ CÂY trong DB, mỗi nhóm bung một panel
 * rộng chia cột liệt kê hạng mục (REQUIREMENTS §A2.1).
 *
 * Vì sao không xổ dọc: nhóm Thay đổi ĐKKD có 9 hạng mục, tổng 32 mục. Danh sách
 * dọc dài quá màn hình, người dùng phải cuộn trong menu.
 *
 * Cây đến từ server component (Header) qua props — component này chỉ giữ state
 * đóng/mở. Khách thêm nhóm trong /admin là menu đổi theo, không sửa code.
 */

/** Link tĩnh nằm cạnh các nhóm dịch vụ. */
export type StaticNavItem = { label: string; href: string }

export function MegaMenu({
  tree,
  staticItems,
  ctaLabel,
  ctaHref,
}: {
  tree: TreeNode[]
  staticItems: StaticNavItem[]
  ctaLabel: string
  ctaHref: string
}) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openGroup, setOpenGroup] = useState<string | null>(null)

  // Đổi trang thì đóng hết, nếu không menu treo lại che nội dung.
  useEffect(() => {
    setMobileOpen(false)
    setOpenGroup(null)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  // Esc đóng panel — người dùng bàn phím cần lối thoát không dùng chuột.
  useEffect(() => {
    if (!openGroup && !mobileOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenGroup(null)
        setMobileOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openGroup, mobileOpen])

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href))

  return (
    <>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={mobileOpen}
        aria-controls="main-nav"
        onClick={() => setMobileOpen((v) => !v)}
      >
        <span className={styles.bar} aria-hidden="true" />
        <span className={styles.bar} aria-hidden="true" />
        <span className={styles.bar} aria-hidden="true" />
        <span className="sr-only">{mobileOpen ? t('nav.menu.close') : t('nav.menu.open')}</span>
      </button>

      <nav
        id="main-nav"
        className={`${styles.nav} ${mobileOpen ? styles.navOpen : ''}`}
        aria-label={t('nav.menu.open')}
        // Rời cả cụm menu thì đóng panel — tránh panel dính lại khi chuột đi thẳng
        // xuống nội dung trang.
        onMouseLeave={() => setOpenGroup(null)}
      >
        <ul className={styles.list}>
          {staticItems.slice(0, 1).map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`${styles.link} ${isActive(item.href) ? styles.active : ''}`}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                {item.label}
              </Link>
            </li>
          ))}

          {tree.map((group) => {
            const expanded = openGroup === group.id
            const active = isActive(group.path)
            return (
              <li
                key={group.id}
                className={styles.groupItem}
                onMouseEnter={() => group.children.length > 0 && setOpenGroup(group.id)}
              >
                <Link
                  href={group.path}
                  className={`${styles.link} ${active ? styles.active : ''}`}
                  aria-current={active ? 'page' : undefined}
                  aria-expanded={group.children.length > 0 ? expanded : undefined}
                  onFocus={() => group.children.length > 0 && setOpenGroup(group.id)}
                >
                  {group.title}
                </Link>

                {group.children.length > 0 ? (
                  <div className={`${styles.panel} ${expanded ? styles.panelOpen : ''}`}>
                    <div className={styles.panelInner}>
                      <div className={styles.panelIntro}>
                        <p className={styles.panelKicker}>Nhóm dịch vụ</p>
                        <p className={styles.panelTitle}>{group.title}</p>
                        {group.summary ? (
                          <p className={styles.panelSummary}>{group.summary}</p>
                        ) : null}
                        <Link className={styles.panelMore} href={group.path}>
                          Trang dịch vụ →
                        </Link>
                      </div>
                      <ul className={styles.panelList}>
                        {group.children.map((child) => (
                          <li key={child.id}>
                            <Link className={styles.panelLink} href={child.path}>
                              {child.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : null}
              </li>
            )
          })}

          {staticItems.slice(1).map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`${styles.link} ${isActive(item.href) ? styles.active : ''}`}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link className={styles.cta} href={ctaHref}>
          {ctaLabel}
        </Link>
      </nav>
    </>
  )
}
