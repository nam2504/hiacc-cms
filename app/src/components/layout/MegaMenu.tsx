'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { TreeNode } from '@/lib/serviceTree'
import { createTranslator } from '@/lib/i18n'
import { DEFAULT_LOCALE, enabledLocaleObjects } from '@/lib/locales'
import { localizedHref } from '@/lib/nav'
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
  locale,
}: {
  tree: TreeNode[]
  staticItems: StaticNavItem[]
  ctaLabel: string
  ctaHref: string
  locale: string
}) {
  const t = createTranslator(locale as Parameters<typeof createTranslator>[0])
  /** Mọi link trong menu phải giữ ngôn ngữ đang xem, không thì bấm là rơi về tiếng Việt. */
  const href = (path: string) => localizedHref(path, locale, DEFAULT_LOCALE)
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

  // Bỏ tiền tố ngôn ngữ trước khi so: ở /en/ke-toan thì pathname có "/en" còn
  // đường dẫn trong cây thì không, so thẳng sẽ không mục nào sáng lên.
  const current =
    locale === DEFAULT_LOCALE ? pathname : pathname.replace(new RegExp(`^/${locale}`), '') || '/'
  const isActive = (path: string) => (path === '/' ? current === '/' : current.startsWith(path))

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
                href={href(item.href)}
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
                  href={href(group.path)}
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
                        <p className={styles.panelKicker}>{t('nav.serviceGroup')}</p>
                        <p className={styles.panelTitle}>{group.title}</p>
                        {group.summary ? (
                          <p className={styles.panelSummary}>{group.summary}</p>
                        ) : null}
                        <Link className={styles.panelMore} href={href(group.path)}>
                          {t('nav.servicePage')}
                        </Link>
                      </div>
                      <ul className={styles.panelList}>
                        {group.children.map((child) => (
                          <li key={child.id}>
                            <Link className={styles.panelLink} href={href(child.path)}>
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
                href={href(item.href)}
                className={`${styles.link} ${isActive(item.href) ? styles.active : ''}`}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {enabledLocaleObjects.length > 1 ? (
          <div className={styles.locales} role="group" aria-label={t('nav.language')}>
            {enabledLocaleObjects.map((item) => (
              <Link
                key={item.code}
                href={localizedHref(current, item.code, DEFAULT_LOCALE)}
                className={`${styles.locale} ${item.code === locale ? styles.localeActive : ''}`}
                aria-current={item.code === locale ? 'true' : undefined}
                lang={item.code}
                hrefLang={item.code}
                onClick={(e) => {
                  // Bấm nút chuyển ngôn ngữ LÀ quyết định của khách. Hai việc
                  // phải làm trước khi rời trang:
                  // 1. Ghi cookie locale mới ngay — nếu không middleware đọc
                  //    cookie cũ và rewrite ngược lại ngôn ngữ trước đó.
                  // 2. Ép hard navigation thay vì để next/link điều hướng
                  //    client-side: router của App Router không chạy lại
                  //    middleware cho cùng layout, nên dù cookie đã đổi, URL
                  //    vẫn kẹt ở locale cũ (bấm VI sau khi đã ở /en không đi
                  //    đâu cả). Chặn Link, tự set location để browser gửi lại
                  //    request thật.
                  e.preventDefault()
                  document.cookie = `NEXT_LOCALE=${item.code};path=/;max-age=${60 * 60 * 24 * 365}`
                  window.location.href = localizedHref(current, item.code, DEFAULT_LOCALE)
                }}
              >
                {item.code.toUpperCase()}
              </Link>
            ))}
          </div>
        ) : null}

        <Link className={styles.cta} href={href(ctaHref)}>
          {ctaLabel}
        </Link>
      </nav>
    </>
  )
}
