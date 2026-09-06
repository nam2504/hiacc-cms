import { Container } from '@/components/ui/Container'
import { brandName } from '@/config/tenant'
import { createTranslator } from '@/lib/i18n'
import type { Setting } from '@/payload-types'
import styles from './CompanyProfile.module.css'

/**
 * Hai cột trang Giới thiệu: bảng hồ sơ công ty (trái) và nguyên tắc hành nghề
 * (phải) — thiết kế khách 06/09 (`Giới thiệu.png`).
 *
 * Mọi giá trị lấy từ Settings. Dòng nào chưa có dữ liệu thì hiện "Đang cập nhật"
 * thay vì biến mất: bảng hồ sơ mà thiếu dòng giữa trông như lỗi hiển thị, còn
 * chữ "đang cập nhật" nói rõ là chờ nội dung.
 */
export function CompanyProfile({
  settings,
  locale,
}: {
  settings: Setting | null
  locale: string
}) {
  /**
   * Dịch bên TRONG component, không ở tầng module.
   *
   * Bản trước tính `const PENDING = t(...)` ngay khi import file — giá trị đóng
   * băng theo ngôn ngữ mặc định từ lúc server khởi động, nên trang tiếng Anh vẫn
   * hiện "Đang cập nhật" bằng tiếng Việt dù locale đã đúng.
   */
  const tr = createTranslator(locale as Parameters<typeof createTranslator>[0])
  const PENDING = tr('seo.placeholder.pending')

  const rows = [
    {
      label: tr('about.profile.companyName'),
      value: settings?.companyName || brandName(settings?.siteName),
    },
    { label: tr('about.profile.taxCode'), value: settings?.taxCode },
    { label: tr('about.profile.headOffice'), value: settings?.headOfficeAddress },
    { label: tr('about.profile.field'), value: settings?.tagline },
  ]

  const principles = settings?.principles ?? []

  return (
    <section className={styles.section}>
      <Container>
        <div className={styles.grid}>
          <div className={styles.col}>
            <h2 className={styles.heading}>{tr('about.profile.title')}</h2>
            <dl className={styles.table}>
              {rows.map((row) => (
                <div className={styles.row} key={row.label}>
                  <dt className={styles.label}>{row.label}</dt>
                  <dd className={styles.value}>{row.value || PENDING}</dd>
                </div>
              ))}
            </dl>
          </div>

          {principles.length > 0 ? (
            <div className={styles.col}>
              <h2 className={styles.heading}>{tr('about.principles.title')}</h2>
              <ul className={styles.principles}>
                {principles.map((item, index) => (
                  <li className={styles.principle} key={item.id ?? index}>
                    <h3 className={styles.principleTitle}>{item.title}</h3>
                    <p className={styles.principleBody}>{item.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  )
}
