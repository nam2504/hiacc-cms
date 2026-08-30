import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { FOOTER_NAV } from '@/lib/nav'
import { t } from '@/lib/i18n'
import type { Post, Setting } from '@/payload-types'
import styles from './Footer.module.css'

/**
 * Chân trang theo AUDIT §3.9: về chúng tôi · liên hệ · bài viết gần đây · bản quyền.
 * Toàn bộ text lấy từ Settings — khối nào thiếu dữ liệu thì tự ẩn.
 */
export function Footer({
  settings,
  recentPosts = [],
}: {
  settings: Setting | null
  recentPosts?: Post[]
}) {
  const socials = [
    { href: settings?.facebook, label: 'Facebook' },
    { href: settings?.tiktok, label: 'TikTok' },
    { href: settings?.youtube, label: 'YouTube' },
    { href: settings?.twitter, label: 'Twitter' },
  ].filter((s): s is { href: string; label: string } => Boolean(s.href))

  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.grid}>
          <div className={styles.col}>
            <h3 className={styles.heading}>{t('footer.about')}</h3>
            {settings?.aboutShort && <p className={styles.text}>{settings.aboutShort}</p>}
            {settings?.companyName && <p className={styles.text}>{settings.companyName}</p>}
            {settings?.taxCode && (
              <p className={styles.text}>
                {t('common.taxCode')}: {settings.taxCode}
              </p>
            )}
          </div>

          <div className={styles.col}>
            <h3 className={styles.heading}>{t('footer.quickLinks')}</h3>
            <ul className={styles.list}>
              {FOOTER_NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={styles.link}>
                    {t(item.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.col}>
            <h3 className={styles.heading}>{t('footer.contact')}</h3>
            {settings?.headOfficeAddress && (
              <p className={styles.text}>{settings.headOfficeAddress}</p>
            )}
            {settings?.hotline && (
              <p className={styles.text}>
                <a className={styles.link} href={`tel:${settings.hotline.replace(/\s/g, '')}`}>
                  {t('common.hotline')}: {settings.hotline}
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
              <h3 className={styles.heading}>{t('footer.recentPosts')}</h3>
              <ul className={styles.list}>
                {recentPosts.map((post) => (
                  <li key={post.id}>
                    <Link href={`/tin-tuc/${post.slug}`} className={styles.link}>
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
            {settings?.copyright || `© ${year} ${settings?.siteName || 'HiACC'}`}
          </p>
        </div>
      </Container>
    </footer>
  )
}
