import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { t } from '@/lib/i18n'
import styles from './EmptyState.module.css'

/**
 * Trạng thái rỗng cho danh sách bài viết.
 *
 * 9/12 chuyên mục seed hiện chưa có bài, nên đây là trường hợp THƯỜNG GẶP
 * chứ không phải ngoại lệ: phải ra một khối tử tế có lối đi tiếp, không phải
 * trang trắng.
 *
 * V2 (REVIEW-visual.md §7①): `news.empty.icon` giờ là khoá icon 'newspaper'
 * (xem `Icon.tsx`), không còn emoji.
 */
export function EmptyState({
  title,
  body,
  actionHref,
  actionLabel,
}: {
  title: string
  body: string
  actionHref?: string
  actionLabel?: string
}) {
  return (
    <div className={styles.empty}>
      <Icon name={t('news.empty.icon')} className={styles.icon} />
      <p className={styles.title}>{title}</p>
      <p className={styles.body}>{body}</p>
      {actionHref && actionLabel && (
        <Button href={actionHref} variant="outline">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
