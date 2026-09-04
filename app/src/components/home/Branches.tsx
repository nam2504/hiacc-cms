import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import { t } from '@/lib/i18n'
import type { Branch, Setting } from '@/payload-types'
import styles from './Branches.module.css'

/**
 * Khối 6 — AUDIT §3.6: 5 chi nhánh từ getBranches().
 * phone/email/mapUrl là field tuỳ chọn (seed đang để trống chờ khách xác nhận)
 * → từng dòng tự ẩn khi thiếu, nút "Xem bản đồ" chỉ hiện khi có mapUrl.
 */
export function Branches({
  branches,
  settings,
}: {
  branches: Branch[]
  settings?: Setting | null
}) {
  if (branches.length === 0) return null

  const home = settings?.home

  return (
    <Section
      tone="soft"
      title={home?.branchesTitle || t('home.branches.title')}
      subtitle={home?.branchesSubtitle || t('home.branches.subtitle')}
    >
      <ul className={styles.grid}>
        {branches.map((branch) => (
          <li key={branch.id} className={styles.card}>
            <h3 className={styles.city}>{branch.city}</h3>

            <dl className={styles.details}>
              <dt className={styles.term}>{t('common.address')}</dt>
              <dd className={styles.desc}>{branch.address}</dd>

              {branch.phone && (
                <>
                  <dt className={styles.term}>{t('common.hotline')}</dt>
                  <dd className={styles.desc}>
                    <a className={styles.link} href={`tel:${branch.phone}`}>
                      {branch.phone}
                    </a>
                  </dd>
                </>
              )}

              {branch.email && (
                <>
                  <dt className={styles.term}>{t('common.email')}</dt>
                  <dd className={styles.desc}>
                    <a className={styles.link} href={`mailto:${branch.email}`}>
                      {branch.email}
                    </a>
                  </dd>
                </>
              )}
            </dl>

            {branch.mapUrl && (
              <div className={styles.action}>
                <Button href={branch.mapUrl} variant="outline" external>
                  {t('common.viewMap')}
                </Button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </Section>
  )
}
