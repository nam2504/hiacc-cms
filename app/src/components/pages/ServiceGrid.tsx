import Image from 'next/image'
import Link from 'next/link'
import { Icon } from '@/components/ui/Icon'
import { t } from '@/lib/i18n'
import { mediaAlt, mediaUrl } from '@/lib/site'
import type { Service } from '@/payload-types'
import styles from './ServiceGrid.module.css'

/**
 * Lưới thẻ dịch vụ cho trang /dich-vu.
 *
 * CỐ Ý LẶP với src/components/home/Services.tsx (W1): bản của W1 tự bọc
 * <Section> kèm tiêu đề riêng của trang chủ và thuộc quyền sở hữu của gói khác,
 * không dùng lại nguyên khối được. Theo rule AI-01 chỉ nêu ra, không trích xuất.
 *
 * Danh sách rỗng (DB lỗi / chưa seed) → hiện dòng báo trống thay vì lưới cụt.
 *
 * V2 (REVIEW-visual.md §7①): `service.icon` là khoá icon (xem `Icon.tsx`),
 * không còn emoji. Khoá lạ/rỗng tự rơi về fallback an toàn trong `<Icon>`.
 */
export function ServiceGrid({ services }: { services: Service[] }) {
  if (services.length === 0) {
    return <p className={styles.empty}>{t('services.empty')}</p>
  }

  return (
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
              <h2 className={styles.title}>{service.name}</h2>
              {service.summary && <p className={styles.summary}>{service.summary}</p>}
              <span className={styles.more} aria-hidden="true">
                {t('common.readMore')}
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
