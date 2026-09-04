import { RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import type { JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import { textStateStyle } from '@/lib/richTextColors'
import styles from './RichText.module.css'

/**
 * Render nội dung richText từ CMS (pages.content, posts.content, services.content).
 * Dùng converter chính chủ của Payload — KHÔNG tự viết serializer, vì mỗi gói tự
 * viết một kiểu là ra ba kiểu hiển thị khác nhau cho cùng một thứ.
 *
 * NGOẠI LỆ duy nhất: text node. Converter mặc định chỉ đọc `node.format`
 * (đậm/nghiêng/gạch/…) và bỏ qua `node.$` — nơi TextStateFeature lưu màu chữ và
 * màu nền. Hậu quả đo được: admin hiện màu, DB lưu đúng, trang public ra thẻ trơ
 * không màu (P1-03). Nên phải bọc lại đúng một converter này.
 *
 * Field richText chưa nhập thì trả null → trang vẫn render, không vỡ.
 */
const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  text: ({ node }) => {
    // Giữ nguyên đường đi mặc định cho mọi định dạng cũ (đậm/nghiêng/gạch/…).
    const fallback = defaultConverters.text
    const base =
      typeof fallback === 'function' ? fallback({ node } as never) : node.text

    const style = textStateStyle(node)
    if (!style) return base
    return <span style={style}>{base}</span>
  },
})

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
      <LexicalRichText data={data} converters={converters} />
    </div>
  )
}
