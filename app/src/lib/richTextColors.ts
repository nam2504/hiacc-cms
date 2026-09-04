/**
 * Bảng màu chữ / tô nền của trình soạn thảo.
 *
 * Đặt riêng vì HAI nơi phải đọc CÙNG một định nghĩa:
 *   - `payload.config.ts` → dựng nút màu trong admin (TextStateFeature)
 *   - `components/ui/RichText.tsx` → render màu đó ra trang public
 * Chép thành hai bản thì lần sửa sau sẽ lệch, và triệu chứng là "admin thấy màu
 * nhưng trang ngoài mất màu" — đúng lỗi P1-03 đã gặp.
 *
 * Dùng lại `defaultColors` của Payload thay vì tự chọn mã màu: nó đã cân bằng
 * sáng/tối sẵn qua `light-dark()`, và giữ đúng tên state (`text-red`, `bg-red`)
 * nên nội dung khách đã lưu không phải migrate khi đổi bảng màu.
 */
import { defaultColors } from '@payloadcms/richtext-lexical'

/** Khớp schema `state` mà TextStateFeature nhận. */
export const RICH_TEXT_STATE = {
  color: { ...defaultColors.text, ...defaultColors.background },
} as const

/**
 * Tra CSS của một text node đã tô màu.
 *
 * Lexical lưu state vào key `$` của node (xem `features/textState/textState.js`).
 * Converter mặc định của Payload CHỈ đọc `node.format` (đậm/nghiêng/…) nên bỏ qua
 * hoàn toàn `$` — vì vậy phải tự ghép style ở phía render.
 *
 * Giá trị lạ (khách đổi bảng màu sau khi đã lưu bài) thì bỏ qua, không ném lỗi:
 * mất màu một đoạn chữ vẫn hơn là vỡ cả trang bài viết.
 */
export function textStateStyle(node: unknown): Record<string, string> | undefined {
  const state = (node as { $?: Record<string, unknown> })?.$
  if (!state || typeof state !== 'object') return undefined

  const style: Record<string, string> = {}
  for (const [stateKey, stateValue] of Object.entries(state)) {
    if (typeof stateValue !== 'string') continue
    const values = (RICH_TEXT_STATE as Record<string, Record<string, { css?: Record<string, string> }>>)[
      stateKey
    ]
    const css = values?.[stateValue]?.css
    if (!css) continue
    for (const [prop, value] of Object.entries(css)) {
      // React nhận camelCase; bảng màu của Payload viết kebab-case.
      style[prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())] = value
    }
  }
  return Object.keys(style).length > 0 ? style : undefined
}
