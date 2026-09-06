import Image from 'next/image'
import Link from 'next/link'
import { mediaAlt, mediaUrl } from '@/lib/site'
import { DEFAULT_LOCALE } from '@/lib/locales'
import { localizedHref } from '@/lib/nav'
import { createTranslator } from '@/lib/i18n'
import { getRequestLocale } from '@/lib/requestLocale'
import { formatPostDate } from './date'
import type { Category, Post } from '@/payload-types'
import styles from './PostCard.module.css'

/**
 * Thẻ một bài viết trong lưới danh sách (/tin-tuc và /chuyen-muc/<slug>).
 *
 * Dữ liệu seed hiện chưa có `cover` lẫn `excerpt` — đây là trạng thái khách
 * nhìn thấy đầu tiên, nên thiếu ảnh thì thay bằng ô giữ chỗ có chữ cái đầu
 * của tiêu đề, không để lỗ hổng trong lưới.
 */
export async function PostCard({ post }: { post: Post }) {
  // Link bài/chuyên mục phải giữ ngôn ngữ đang xem; bản EN dùng path thô
  // là bấm vào rơi thẳng về trang tiếng Việt.
  const locale = await getRequestLocale()
  const t = createTranslator(await getRequestLocale())
  const cover = mediaUrl(post.cover)
  const category = typeof post.category === 'object' ? (post.category as Category) : null
  const date = formatPostDate(post.publishedAt)

  return (
    <article className={styles.card}>
      <Link className={styles.cover} href={localizedHref(`/tin-tuc/${post.slug}`, locale, DEFAULT_LOCALE)} tabIndex={-1} aria-hidden="true">
        {cover ? (
          /**
           * `fill` thay vì width/height cố định: ô .cover đã khoá aspect-ratio 3/2
           * và position:relative, nên ảnh bìa tỉ lệ bất kỳ vẫn phủ kín ô mà không
           * làm xô lưới. Kích thước thật của file nằm trong Media nhưng khách
           * upload ảnh lệch tỉ lệ là chuyện thường, đừng tin vào nó để dựng khung.
           */
          <Image
            className={styles.coverImage}
            src={cover}
            alt={mediaAlt(post.cover, post.title)}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <span className={styles.coverFallback}>{post.title.charAt(0)}</span>
        )}
      </Link>

      <div className={styles.body}>
        <div className={styles.meta}>
          {category && (
            <Link className={styles.category} href={localizedHref(`/chuyen-muc/${category.slug}`, locale, DEFAULT_LOCALE)}>
              {category.name}
            </Link>
          )}
          {date && (
            <time className={styles.date} dateTime={post.publishedAt ?? undefined}>
              {date}
            </time>
          )}
        </div>

        <h3 className={styles.title}>
          <Link className={styles.titleLink} href={localizedHref(`/tin-tuc/${post.slug}`, locale, DEFAULT_LOCALE)}>
            {post.title}
          </Link>
        </h3>

        {post.excerpt && <p className={styles.excerpt}>{post.excerpt}</p>}

        <span className={styles.more} aria-hidden="true">
          {t('common.readMore')}
        </span>
      </div>
    </article>
  )
}
