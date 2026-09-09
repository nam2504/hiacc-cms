import { Container } from '@/components/ui/Container'
import { brandName } from '@/config/tenant'
import { createTranslator } from '@/lib/i18n'
import { getRequestLocale } from '@/lib/requestLocale'
import type { Setting } from '@/payload-types'
import { Logo } from './Logo'
import styles from './Footer.module.css'

/**
 * Chân trang 4 cột theo Figma: thương hiệu · trụ sở · liên hệ · kênh liên kết.
 * Toàn bộ text lấy từ Settings — khối nào thiếu dữ liệu thì tự ẩn.
 *
 * Bản trước có thêm 2 cột "Liên kết nhanh" (cây dịch vụ + FOOTER_NAV) và "Bài
 * viết gần đây". Figma không có chúng và khách chốt bỏ hẳn để footer đúng 1:1
 * (09/09) — vì vậy props `recentPosts`/`tree` cũng không còn cần nữa.
 */
export async function Footer({ settings }: { settings: Setting | null }) {
  const locale = await getRequestLocale()
  const tr = createTranslator(locale)

  // Mạng xã hội là link ra ngoài nên KHÔNG bọc localizedHref.
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
            {/* Figma đặt tên công ty NẰM NGANG cạnh logo, ngăn bằng vạch dọc. */}
            <div className={styles.brand}>
              <Logo settings={settings} className={styles.logo} priority={false} />
              {settings?.companyName ? (
                <p className={styles.companyName}>{settings.companyName}</p>
              ) : null}
            </div>
            {settings?.taxCode ? (
              <p className={styles.text}>
                {tr('common.taxCode')}: {settings.taxCode}
              </p>
            ) : null}
          </div>

          <div className={styles.col}>
            <h3 className={styles.heading}>{headings?.headOffice || tr('footer.headOffice')}</h3>
            {settings?.headOfficeAddress ? (
              <p className={styles.text}>{settings.headOfficeAddress}</p>
            ) : null}
          </div>

          <div className={styles.col}>
            <h3 className={styles.heading}>{headings?.contact || tr('footer.contact')}</h3>
            {settings?.hotline ? (
              <p className={styles.text}>
                <a className={styles.link} href={`tel:${settings.hotline.replace(/\s/g, '')}`}>
                  {tr('common.hotline')}: {settings.hotline}
                </a>
              </p>
            ) : null}
            {settings?.email ? (
              <p className={styles.text}>
                <a className={styles.link} href={`mailto:${settings.email}`}>
                  {settings.email}
                </a>
              </p>
            ) : null}
          </div>

          {socials.length > 0 ? (
            <div className={styles.col}>
              <h3 className={styles.heading}>{headings?.followUs || tr('footer.followUs')}</h3>
              <ul className={styles.list}>
                {socials.map((s) => (
                  <li key={s.label}>
                    <a
                      className={styles.social}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
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
