import { Container } from '@/components/ui/Container'
import { brandName } from '@/config/tenant'
import { t } from '@/lib/i18n'
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
const PENDING = t('seo.placeholder.pending')

export function CompanyProfile({ settings }: { settings: Setting | null }) {
  const rows = [
    { label: 'Tên công ty', value: settings?.companyName || brandName(settings?.siteName) },
    { label: 'Mã số thuế', value: settings?.taxCode },
    { label: 'Trụ sở', value: settings?.headOfficeAddress },
    { label: 'Lĩnh vực', value: settings?.tagline },
  ]

  const principles = settings?.principles ?? []

  return (
    <section className={styles.section}>
      <Container>
        <div className={styles.grid}>
          <div className={styles.col}>
            <h2 className={styles.heading}>Hồ sơ công ty</h2>
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
              <h2 className={styles.heading}>Nguyên tắc hành nghề</h2>
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
