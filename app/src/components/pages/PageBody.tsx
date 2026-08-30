import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { RichText } from '@/components/ui/RichText'
import { t } from '@/lib/i18n'
import styles from './PageBody.module.css'

/**
 * Thân bài richText của trang tĩnh / trang dịch vụ.
 *
 * Seed để `content` TRỐNG có chủ ý (khách tự viết sau), nên đây là trạng thái
 * đầu tiên khách nhìn thấy → thay vì trả về null làm trang cụt, hiện một ô ghi
 * "nội dung đang cập nhật". Chỗ nào không muốn ô đó thì truyền `fallback={false}`.
 *
 * Kiểu `content` sinh trong payload-types là object lexical dựng sẵn, rộng hơn
 * SerializedEditorState một chút → ép kiểu đúng một chỗ ở đây, component gọi
 * không phải tự ép.
 */
export function PageBody({
  content,
  fallback = true,
}: {
  content?: unknown
  fallback?: boolean
}) {
  if (!content) {
    if (!fallback) return null
    return <p className={styles.empty}>{t('page.contentComingSoon')}</p>
  }

  return <RichText data={content as SerializedEditorState} />
}
