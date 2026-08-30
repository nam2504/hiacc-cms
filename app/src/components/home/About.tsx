import { Icon } from '@/components/ui/Icon'
import { Section } from '@/components/ui/Section'
import { t } from '@/lib/i18n'
import type { Setting } from '@/payload-types'
import styles from './About.module.css'

/**
 * Khối 4 — AUDIT §3.4: 4 điểm tin cậy.
 * Đoạn giới thiệu ngắn lấy từ Settings.aboutShort (khách sửa được trong admin),
 * 4 điểm tin cậy là nội dung tĩnh nên đi qua t().
 *
 * V2 (REVIEW-visual.md §7①): emoji thay bằng khoá icon SVG (`Icon.tsx`), không
 * đổi ý nghĩa nội dung — chỉ đổi cách vẽ. 4 khoá này cố định, không phụ thuộc C1.
 */
const POINTS = [
  {
    key: 'certification',
    icon: 'award',
    title: 'home.about.certification.title',
    body: 'home.about.certification.body',
  },
  { key: 'team', icon: 'education', title: 'home.about.team.title', body: 'home.about.team.body' },
  { key: 'legal', icon: 'legal', title: 'home.about.legal.title', body: 'home.about.legal.body' },
  {
    key: 'support',
    icon: 'phone',
    title: 'home.about.support.title',
    body: 'home.about.support.body',
  },
] as const

export function About({ settings }: { settings: Setting | null }) {
  return (
    <Section
      tone="soft"
      title={t('home.about.title')}
      subtitle={settings?.aboutShort || t('home.about.subtitle')}
    >
      <ul className={styles.grid}>
        {POINTS.map((point) => (
          <li key={point.key} className={styles.card}>
            <Icon name={point.icon} className={styles.icon} />
            <h3 className={styles.title}>{t(point.title)}</h3>
            <p className={styles.body}>{t(point.body)}</p>
          </li>
        ))}
      </ul>
    </Section>
  )
}
