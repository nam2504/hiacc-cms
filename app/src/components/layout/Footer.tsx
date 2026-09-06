import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { brandName } from '@/config/tenant'
import { FOOTER_NAV, localizedHref } from '@/lib/nav'
import { createTranslator } from '@/lib/i18n'
import { DEFAULT_LOCALE } from '@/lib/locales'
import { getRequestLocale } from '@/lib/requestLocale'
import type { TreeNode } from '@/lib/serviceTree'
import type { Post, Setting } from '@/payload-types'
import styles from './Footer.module.css'

/**
 * Chân trang theo AUDIT §3.9: về chúng tôi · liên hệ · bài viết gần đây · bản quyền.
 * Toàn bộ text lấy từ Settings — khối nào thiếu dữ liệu thì tự ẩn.
 */
export async function Footer({
  settings,
  recentPosts = [],
  tree = [],
}: {
  settings: Setting | null
  recentPosts?: Post[]
  /** Cây dịch vụ — footer liệt kê các nhóm, sinh từ DB như menu chính. */
  tree?: TreeNode[]
}) {
  // Mọi link nội bộ trong footer phải giữ ngôn ngữ đang xem; mạng xã hội,
  // tel: và mailto: là link ra ngoài nên KHÔNG bọc.
  const locale = await getRequestLocale()
  const tr = createTranslator(locale)
  const href = (path: string) => localizedHref(path, locale, DEFAULT_LOCALE)

  const socials = [
    { href: settings?.facebook, label: 'Facebook' },
    { href: settings?.tiktok, label: 'TikTok' },
    { href: settings?.youtube, label: 'YouTube' },
    { href: settings?.twitter, label: 'Twitter' },
  ].filter((s): s is { href: string; label: string } => Boolean(s.href))

  const year = new Date().getFullYear()
  // Tiêu đề cột: ô trống trong admin thì dùng nhãn mặc định của cột đó.
  const headings = settings?.footerHeadings

  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.grid}>
          <div className={styles.col}>
            <h3 className={styles.heading}>{headings?.about || tr('footer.about')}</h3>
            {settings?.aboutShort && <p className={styles.text}>{settings.aboutShort}</p>}
            {settings?.companyName && <p className={styles.text}>{settings.companyName}</p>}
            {settings?.taxCode && (
              <p className={styles.text}>
                {tr('common.taxCode')}: {settings.taxCode}
              </p>
            )}
          </div>

          <div className={styles.col}>
            <h3 className={styles.heading}>{headings?.quickLinks || tr('footer.quickLinks')}</h3>
            <ul className={styles.list}>
              {/* Nhóm dịch vụ sinh từ cây trong DB; các link còn lại là trang tĩnh. */}
              {tree.map((group) => (
                <li key={group.id}>
                  <Link href={href(group.path)} className={styles.link}>
                    {group.title}
                  </Link>
                </li>
              ))}
              {FOOTER_NAV.map((item) => (
                <li key={item.href}>
                  <Link href={href(item.href)} className={styles.link}>
                    {tr(item.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.col}>
            <h3 className={styles.heading}>{headings?.contact || tr('footer.contact')}</h3>
            {settings?.headOfficeAddress && (
              <p className={styles.text}>{settings.headOfficeAddress}</p>
            )}
            {settings?.hotline && (
              <p className={styles.text}>
                <a className={styles.link} href={`tel:${settings.hotline.replace(/\s/g, '')}`}>
                  {tr('common.hotline')}: {settings.hotline}
                </a>
              </p>
            )}
            {settings?.email && (
              <p className={styles.text}>
                <a className={styles.link} href={`mailto:${settings.email}`}>
                  {settings.email}
                </a>
              </p>
            )}
            {socials.length > 0 && (
              <div className={styles.socials}>
                <h3 className={styles.heading}>
                  {headings?.followUs || tr('footer.followUs')}
                </h3>
                {socials.map((s) => (
                  <a
                    key={s.label}
                    className={styles.social}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {recentPosts.length > 0 && (
            <div className={styles.col}>
              <h3 className={styles.heading}>
                {headings?.recentPosts || tr('footer.recentPosts')}
              </h3>
              <ul className={styles.list}>
                {recentPosts.map((post) => (
                  <li key={post.id}>
                    <Link href={href(`/tin-tuc/${post.slug}`)} className={styles.link}>
                      {post.title}
                    </Link>
                    {post.publishedAt && (
                      <time className={styles.date} dateTime={post.publishedAt}>
                        {new Date(post.publishedAt).toLocaleDateString('vi-VN')}
                      </time>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            {settings?.copyright || `© ${year} ${brandName(settings?.siteName)}`}
          </p>
        </div>
      </Container>
    </footer>
  )
}
