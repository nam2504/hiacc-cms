import type { Metadata } from 'next'

/** searchParams của Next 16 là Promise và mỗi khoá có thể là mảng. */
export type SearchParams = Promise<Record<string, string | string[] | undefined>>

/**
 * Đọc `?page=` từ searchParams. Mọi giá trị bậy (chữ, số âm, 0, mảng) đều về 1
 * thay vì ném lỗi — người dùng sửa URL bằng tay không được làm sập trang.
 */
export function readPage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value
  const parsed = Number.parseInt(raw ?? '', 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
}

/**
 * Metadata từ nhóm field `seo` của bản ghi, rơi về tiêu đề/mô tả của chính bản ghi.
 * Nhận `undefined` cho seo vì mọi field trong nhóm đều tuỳ chọn.
 */
export function seoMetadata(
  seo: { title?: string | null; description?: string | null } | undefined | null,
  fallbackTitle: string,
  fallbackDescription?: string | null,
): Metadata {
  return {
    title: seo?.title || fallbackTitle,
    description: seo?.description || fallbackDescription || undefined,
  }
}
