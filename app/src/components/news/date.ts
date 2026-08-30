/**
 * Ngày đăng dạng vi-VN (21/08/2026). `publishedAt` được phép trống (Posts.ts nói rõ
 * "bỏ trống thì bài xếp cuối") nên trả null để chỗ gọi tự ẩn dòng ngày.
 *
 * Ép timeZone 'UTC': Payload lưu ngày dạng ISO UTC, để máy chủ tự chọn múi giờ
 * thì cùng một bài có thể lệch một ngày giữa build và runtime.
 *
 * Thẻ 'vi-VN' viết thẳng vì W3 chỉ được yêu cầu định dạng vi-VN; đây là thẻ
 * BCP-47 (không phải mã locale của CMS) nên không ghép từ DEFAULT_LOCALE —
 * ghép sẽ ra 'en-VN' sai khi bật thêm ngôn ngữ.
 */
const DATE_TAG = 'vi-VN'

export function formatPostDate(value?: string | null): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return new Intl.DateTimeFormat(DATE_TAG, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}
