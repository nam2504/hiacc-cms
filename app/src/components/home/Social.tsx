import { Section } from '@/components/ui/Section'
import { t } from '@/lib/i18n'
import type { Setting } from '@/payload-types'
import styles from './Social.module.css'

/**
 * Khối 7 — AUDIT §3.7: link mạng xã hội từ getSettings().
 * Kênh nào trống thì ẩn; trống hết (hoặc settings null) thì ẩn cả khối.
 * Seed hiện chưa có link nào → khối này không render cho tới khi khách điền.
 */
export function Social({ settings }: { settings: Setting | null }) {
  const channels = [
    { key: 'facebook', href: settings?.facebook, label: t('home.social.facebook') },
    { key: 'tiktok', href: settings?.tiktok, label: t('home.social.tiktok') },
    { key: 'youtube', href: settings?.youtube, label: t('home.social.youtube') },
    { key: 'twitter', href: settings?.twitter, label: t('home.social.twitter') },
  ].filter((c): c is { key: string; href: string; label: string } => Boolean(c.href))

  if (channels.length === 0) return null

  return (
    <Section title={t('home.social.title')} subtitle={t('home.social.subtitle')}>
      <ul className={styles.list}>
        {channels.map((channel) => (
          <li key={channel.key}>
            <a
              className={styles.item}
              href={channel.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {channel.label}
            </a>
          </li>
        ))}
      </ul>
    </Section>
  )
}
