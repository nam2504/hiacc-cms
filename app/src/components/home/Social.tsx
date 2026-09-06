import { Section } from '@/components/ui/Section'
import { createTranslator } from '@/lib/i18n'
import { getRequestLocale } from '@/lib/requestLocale'
import type { Setting } from '@/payload-types'
import styles from './Social.module.css'

/**
 * Khối 7 — AUDIT §3.7: link mạng xã hội từ getSettings().
 * Kênh nào trống thì ẩn; trống hết (hoặc settings null) thì ẩn cả khối.
 * Seed hiện chưa có link nào → khối này không render cho tới khi khách điền.
 */
export async function Social({ settings }: { settings: Setting | null }) {
  const locale = await getRequestLocale()
  const tr = createTranslator(locale)
  const channels = [
    { key: 'facebook', href: settings?.facebook, label: tr('home.social.facebook') },
    { key: 'tiktok', href: settings?.tiktok, label: tr('home.social.tiktok') },
    { key: 'youtube', href: settings?.youtube, label: tr('home.social.youtube') },
    { key: 'twitter', href: settings?.twitter, label: tr('home.social.twitter') },
  ].filter((c): c is { key: string; href: string; label: string } => Boolean(c.href))

  if (channels.length === 0) return null

  return (
    <Section
      tone="soft"
      title={settings?.home?.socialTitle || tr('home.social.title')}
      subtitle={settings?.home?.socialSubtitle || tr('home.social.subtitle')}
    >
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
