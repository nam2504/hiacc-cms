import Image from 'next/image'
import Link from 'next/link'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { Container } from '@/components/ui/Container'
import { RichText } from '@/components/ui/RichText'
import { t } from '@/lib/i18n'
import { DEFAULT_LOCALE } from '@/lib/locales'
import { localizedHref } from '@/lib/nav'
import { getRequestLocale } from '@/lib/requestLocale'
import { mediaAlt, mediaUrl } from '@/lib/site'
import { formatPostDate } from './date'
import type { Category, Post } from '@/payload-types'
import styles from './PostArticle.module.css'

/**
 * Thân bài chi tiết: ảnh bìa (nếu có) + meta + nội dung richText.
 *
 * Cả 3 bài seed đều CHƯA có `content`; `<RichText>` trả null khi data rỗng,
 * nên ở đây phải tự hiện dòng "đang cập nhật" thay vì để khoảng trắng.
 */
export async function PostArticle({ post }: { post: Post }) {
  // Link chuyên mục và link quay lại danh sách phải giữ ngôn ngữ đang xem.
  const locale = await getRequestLocale()
  const href = (path: string) => localizedHref(path, locale, DEFAULT_LOCALE)
  const cover = mediaUrl(post.cover)
  const category = typeof post.category === 'object' ? (post.category as Category) : null
  const date = formatPostDate(post.publishedAt)

  /**
   * Ảnh bìa ở trang chi tiết nằm trong luồng văn bản (cao theo tỉ lệ thật), nên
   * next/image cần kích thước gốc. Payload lưu sẵn width/height trong Media;
   * bản ghi cũ thiếu số này thì rơi về khổ 16:9 để không vỡ bố cục — CSS
   * `height: auto` giữ đúng tỉ lệ thật khi ảnh tải xong.
   */
  const coverMedia = typeof post.cover === 'object' && post.cover ? post.cover : null
  const coverWidth = coverMedia?.width ?? 1600
  const coverHeight = coverMedia?.height ?? 900

  return (
    <article className={styles.article}>
      <Container narrow>
        <div className={styles.meta}>
          {category && (
            <Link className={styles.category} href={href(`/chuyen-muc/${category.slug}`)}>
              {category.name}
            </Link>
          )}
          {date && (
            <time className={styles.date} dateTime={post.publishedAt ?? undefined}>
              {date}
            </time>
          )}
        </div>

        <h1 className={styles.title}>{post.title}</h1>

        {post.excerpt && <p className={styles.excerpt}>{post.excerpt}</p>}
      </Container>

      {cover && (
        <Container narrow>
          <Image
            className={styles.cover}
            src={cover}
            alt={mediaAlt(post.cover, post.title)}
            width={coverWidth}
            height={coverHeight}
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
        </Container>
      )}

      <Container narrow>
        {post.content ? (
          <RichText data={post.content as unknown as SerializedEditorState} />
        ) : (
          <p className={styles.pending}>{t('news.post.contentPending')}</p>
        )}

        <p className={styles.back}>
          <Link className={styles.backLink} href={href('/tin-tuc')}>
            {t('news.post.backToList')}
          </Link>
        </p>
      </Container>
    </article>
  )
}
