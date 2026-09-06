import { createTranslator } from '@/lib/i18n'
import { getRequestLocale } from '@/lib/requestLocale'
import type { Setting } from '@/payload-types'
import styles from './ContactInfo.module.css'

/**
 * Khối thông tin liên hệ của trang /lien-he — đọc từ global `settings`
 * (AUDIT §5.5: khách sửa được hết trong admin, không hardcode).
 *
 * Seed để hotline / email / địa chỉ TRỐNG chờ khách xác nhận → mỗi dòng tự ẩn
 * khi thiếu dữ liệu; thiếu hết thì cả khối biến mất thay vì hiện khung rỗng.
 */
export async function ContactInfo({ settings }: { settings: Setting | null }) {
  const tr = createTranslator(await getRequestLocale())
  const hotlines = [settings?.hotline, settings?.hotline2].filter(
    (v): v is string => typeof v === 'string' && v.trim() !== '',
  )
  const { email, headOfficeAddress, taxCode, companyName } = settings ?? {}

  const hasAny =
    hotlines.length > 0 || Boolean(email || headOfficeAddress || taxCode || companyName)
  if (!hasAny) return null

  return (
    <div className={styles.card}>
      {companyName && <h2 className={styles.company}>{companyName}</h2>}

      <dl className={styles.list}>
        {hotlines.length > 0 && (
          <div className={styles.row}>
            <dt className={styles.term}>{tr('common.hotline')}</dt>
            <dd className={styles.desc}>
              {hotlines.map((phone) => (
                // tel: cần số liền, bỏ khoảng trắng và dấu chấm người nhập cho dễ đọc
                <a key={phone} className={styles.phone} href={`tel:${phone.replace(/[\s.]/g, '')}`}>
                  {phone}
                </a>
              ))}
            </dd>
          </div>
        )}

        {email && (
          <div className={styles.row}>
            <dt className={styles.term}>{tr('common.email')}</dt>
            <dd className={styles.desc}>
              <a href={`mailto:${email}`}>{email}</a>
            </dd>
          </div>
        )}

        {headOfficeAddress && (
          <div className={styles.row}>
            <dt className={styles.term}>{tr('contact.headOffice')}</dt>
            <dd className={styles.desc}>{headOfficeAddress}</dd>
          </div>
        )}

        {taxCode && (
          <div className={styles.row}>
            <dt className={styles.term}>{tr('common.taxCode')}</dt>
            <dd className={styles.desc}>{taxCode}</dd>
          </div>
        )}
      </dl>
    </div>
  )
}
