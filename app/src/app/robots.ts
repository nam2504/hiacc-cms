import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/seo'

/**
 * /robots.txt — site tham chiếu không có file này (AUDIT §5.2), mà site dịch vụ
 * kế toán sống bằng SEO nên đây là mất mát lớn nhất phải bù.
 *
 * Chặn `/admin` (trang quản trị Payload) và `/api` (REST + file media route):
 * cả hai không có nội dung cho người đọc, để Google bò vào chỉ tốn crawl budget
 * và làm lộ bề mặt quản trị trong kết quả tìm kiếm.
 *
 * ⚠️ File này PHẢI nằm ở `src/app/`, KHÔNG được để trong route group `(site)`.
 * Đặt trong `(site)` thì catch-all `(site)/[...notFound]` (dựng theo INTERFACE §7.2
 * để bắt 404 khi dự án không có root layout) nuốt luôn `/robots.txt` và trả 404 —
 * đã đo thật bằng curl. `sitemap.ts` không dính bẫy này nên vẫn ở `(site)`.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api'],
    },
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}
