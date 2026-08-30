'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { MAIN_NAV, type NavItem } from '@/lib/nav'
import { t } from '@/lib/i18n'
import { LanguageSwitcher } from './LanguageSwitcher'
import { DEFAULT_LOCALE } from '@/lib/locales'
import styles from './MainNav.module.css'

/**
 * Menu chính + menu mobile. Nhãn lấy qua t(item.labelKey) — nhãn tiếng Việt trong
 * nav.ts chỉ là dự phòng khi chưa có bản dịch.
 *
 * Chỉ mở bằng CSS + state, KHÔNG dùng jQuery như site cũ (AUDIT §5.6).
 */
export function MainNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Đổi trang thì đóng menu mobile, nếu không nó treo lại che nội dung
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Khoá cuộn nền khi menu mobile đang mở
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  const renderItem = (item: NavItem) => (
    <li key={item.href} className={item.children ? styles.hasChildren : undefined}>
      <Link
        href={item.href}
        className={`${styles.link} ${isActive(item.href) ? styles.active : ''}`}
        aria-current={isActive(item.href) ? 'page' : undefined}
      >
        {t(item.labelKey)}
        {item.children && <span className={styles.caret} aria-hidden="true" />}
      </Link>
      {item.children && (
        <ul className={styles.submenu}>
          {item.children.map((child) => (
            <li key={child.href}>
              <Link href={child.href} className={styles.sublink}>
                {t(child.labelKey)}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  )

  return (
    <>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls="main-nav"
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles.bar} aria-hidden="true" />
        <span className={styles.bar} aria-hidden="true" />
        <span className={styles.bar} aria-hidden="true" />
        <span className="sr-only">{open ? t('nav.menu.close') : t('nav.menu.open')}</span>
      </button>

      <nav
        id="main-nav"
        className={`${styles.nav} ${open ? styles.navOpen : ''}`}
        aria-label={t('nav.menu.open')}
      >
        <ul className={styles.list}>{MAIN_NAV.map(renderItem)}</ul>
        <div className={styles.navFooter}>
          <LanguageSwitcher current={DEFAULT_LOCALE} />
        </div>
      </nav>
    </>
  )
}
