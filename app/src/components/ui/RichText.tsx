import { RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import styles from './RichText.module.css'

/**
 * Render nội dung richText từ CMS (pages.content, posts.content, services.content).
 * Dùng converter chính chủ của Payload — KHÔNG tự viết serializer, vì mỗi gói tự
 * viết một kiểu là ra ba kiểu hiển thị khác nhau cho cùng một thứ.
 *
 * Field richText chưa nhập thì trả null → trang vẫn render, không vỡ.
 */
export function RichText({
  data,
  className = '',
}: {
  data?: SerializedEditorState | null
  className?: string
}) {
  if (!data) return null

  return (
    <div className={`${styles.prose} ${className}`}>
      <LexicalRichText data={data} />
    </div>
  )
}
