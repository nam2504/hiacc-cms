import Image from 'next/image'
import Link from 'next/link'
import type { Post } from '@/payload-types'
import { mediaAlt, mediaUrl } from '@/lib/site'
import { formatPostDate } from './date'
import styles from './FeaturedPost.module.css'

/**
 * Bài nổi bật đầu trang Bản tin — ảnh trái, nội dung phải (thiết kế khách 06/09).
 * Bài mới nhất được đẩy lên đây, phần còn lại xuống lưới "Bài mới".
 */
export function FeaturedPost({ post }: { post: Post }) {
  const cover = mediaUrl(post.cover)
  const category = typeof post.category === 'object' ? post.category : null

  return (
    <article className={styles.featured}>
      {cover ? (
        <Link className={styles.media} href={`/tin-tuc/${post.slug}`} tabIndex={-1} aria-hidden="true">
          <Image
            className={styles.image}
            src={cover}
            alt={mediaAlt(post.cover, '')}
            width={720}
            height={480}
            priority
            sizes="(min-width: 900px) 50vw, 100vw"
          />
        </Link>
      ) : null}

      <div className={styles.body}>
        <p className={styles.meta}>
          <span className={styles.badge}>Bài nổi bật</span>
          {post.publishedAt ? (
            <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
          ) : null}
          {category?.name ? <span className={styles.category}>{category.name}</span> : null}
        </p>

        <h2 className={styles.title}>
          <Link className={styles.titleLink} href={`/tin-tuc/${post.slug}`}>
            {post.title}
          </Link>
        </h2>

        {post.excerpt ? <p className={styles.excerpt}>{post.excerpt}</p> : null}

        <Link className={styles.action} href={`/tin-tuc/${post.slug}`}>
          Đọc bài viết
        </Link>
      </div>
    </article>
  )
}
