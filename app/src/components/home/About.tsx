import { Icon } from '@/components/ui/Icon'
import { Section } from '@/components/ui/Section'
import { t } from '@/lib/i18n'
import type { Setting } from '@/payload-types'
import styles from './About.module.css'

/**
 * Khối 4 — AUDIT §3.4: 4 điểm tin cậy.
 * Đoạn giới thiệu ngắn và 4 điểm tin cậy đều lấy từ Settings (khách sửa trong
 * admin); để trống thì dùng bản mặc định trong t().
 *
 * V2 (REVIEW-visual.md §7①): emoji thay bằng khoá icon SVG (`Icon.tsx`), không
 * đổi ý nghĩa nội dung — chỉ đổi cách vẽ. 4 khoá này cố định, không phụ thuộc C1.
 */
const DEFAULT_POINTS = [
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
  const home = settings?.home
  const custom = home?.aboutPoints

  // Cùng quy tắc với Stats: chỉ nhận thẻ có đủ tiêu đề + mô tả, mảng trống thì
  // rơi về 4 điểm mặc định.
  const points =
    custom && custom.length > 0
      ? custom
          .filter((row) => row.title && row.body)
          .map((row) => ({
            key: row.id ?? row.title!,
            icon: row.icon ?? 'award',
            title: row.title!,
            body: row.body!,
          }))
      : DEFAULT_POINTS.map((p) => ({
          key: p.key,
          icon: p.icon,
          title: t(p.title),
          body: t(p.body),
        }))

  return (
    <Section
      tone="soft"
      title={home?.aboutTitle || t('home.about.title')}
      subtitle={settings?.aboutShort || t('home.about.subtitle')}
    >
      <ul className={styles.grid}>
        {points.map((point) => (
          <li key={point.key} className={styles.card}>
            <Icon name={point.icon} className={styles.icon} />
            <h3 className={styles.title}>{point.title}</h3>
            <p className={styles.body}>{point.body}</p>
          </li>
        ))}
      </ul>
    </Section>
  )
}
