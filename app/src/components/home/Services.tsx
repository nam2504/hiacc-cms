import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Section } from '@/components/ui/Section'
import { t } from '@/lib/i18n'
import { mediaAlt, mediaUrl } from '@/lib/site'
import type { Service } from '@/payload-types'
import styles from './Services.module.css'

/**
 * Khối 5 — AUDIT §3.5: danh sách dịch vụ đọc từ collection `services`.
 * Danh sách rỗng (DB lỗi / chưa seed) → ẩn hẳn khối thay vì hiện tiêu đề trống.
 *
 * V2 (REVIEW-visual.md §7①): `service.icon` là khoá icon (xem `Icon.tsx`),
 * không còn emoji. Khoá lạ/rỗng tự rơi về fallback an toàn trong `<Icon>`.
 */
export function Services({ services }: { services: Service[] }) {
  if (services.length === 0) return null

  return (
    <Section title={t('home.services.title')} subtitle={t('home.services.subtitle')}>
      <ul className={styles.grid}>
        {services.map((service) => {
          const cover = mediaUrl(service.image)
          return (
            <li key={service.id}>
              <Link className={styles.card} href={`/dich-vu/${service.slug}`}>
                {cover ? (
                  <span className={styles.cover}>
                    <Image
                      className={styles.coverImage}
                      src={cover}
                      alt={mediaAlt(service.image, service.name)}
                      fill
                      sizes="(max-width: 480px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </span>
                ) : null}
                <Icon name={service.icon} className={styles.icon} />
                <h3 className={styles.title}>{service.name}</h3>
                {service.summary && <p className={styles.summary}>{service.summary}</p>}
              </Link>
            </li>
          )
        })}
      </ul>
      {/* 7 dịch vụ trên lưới 3 cột để trống 2 ô hàng cuối; nút đặt ở đây vừa
          đóng khoảng trắng đó vừa thêm một điểm hành động giữa trang. */}
      <div className={styles.footer}>
        <Button href="/dich-vu" variant="outline">
          {t('home.services.viewAll')}
        </Button>
      </div>
    </Section>
  )
}
