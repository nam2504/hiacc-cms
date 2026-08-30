/**
 * Hằng và helper cho lớp SEO kỹ thuật (robots, sitemap, OpenGraph, JSON-LD).
 *
 * AUDIT §5.2 và §5.3: site cũ không có robots.txt/sitemap.xml, không có OG tag
 * lẫn structured data. Đây là chỗ tập trung dữ liệu chung cho cả ba thứ đó,
 * để không nơi nào phải hardcode domain lần nữa.
 */
import { mediaUrl } from './site'

/**
 * Domain gốc của site. Deploy đổi domain thì đổi biến môi trường, KHÔNG sửa code.
 * Bỏ dấu `/` cuối để mọi chỗ nối chuỗi ra đúng một dấu gạch.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
).replace(/\/+$/, '')

/** Nối một đường dẫn nội bộ thành URL tuyệt đối — dùng cho canonical, sitemap, JSON-LD. */
export function absoluteUrl(path = '/'): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

/**
 * URL tuyệt đối của ảnh do Payload phục vụ. Ảnh media là đường dẫn tương đối
 * (`/api/media/file/...`), mà Facebook/Zalo đòi URL tuyệt đối mới đọc được OG image.
 * Không có ảnh → null, để nơi gọi BỎ HẲN field thay vì bịa URL (contract §4).
 */
export function absoluteMediaUrl(value: unknown): string | null {
  const url = mediaUrl(value)
  if (!url) return null
  return /^https?:\/\//i.test(url) ? url : absoluteUrl(url)
}

/**
 * Chọn ảnh OG theo thứ tự ưu tiên: ảnh riêng của bản ghi → logo trong Settings →
 * không có gì. Trả về mảng rỗng để trải thẳng vào `openGraph.images`, vì mảng rỗng
 * làm Next bỏ luôn field thay vì sinh thẻ trống.
 */
export function ogImages(...candidates: unknown[]): { url: string }[] {
  for (const candidate of candidates) {
    const url = absoluteMediaUrl(candidate)
    if (url) return [{ url }]
  }
  return []
}
