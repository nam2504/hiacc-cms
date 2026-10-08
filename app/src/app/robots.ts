import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/seo'
import { isStaging } from '@/lib/staging'

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
  /**
   * Bản staging cho khách duyệt: cấm mọi bot, và KHÔNG khai sitemap — khai
   * sitemap ở bản nháp là tự mời bot vào đúng những URL vừa cấm.
   * `robots.txt` chỉ ngăn bò trang, không gỡ được trang đã nằm trong chỉ mục,
   * nên `noindex` ở layout mới là lớp chặn thật. Giữ cả hai.
   */
  if (isStaging()) {
    return { rules: { userAgent: '*', disallow: '/' } }
  }

  /**
   * Mở riêng `/api/media/file/` (08/10): favicon và ảnh OG do khách tải lên đều
   * nằm dưới đường này. Chặn cả `/api` thì Googlebot không lấy được icon → kết quả
   * tìm kiếm hiện quả địa cầu mặc định. Google chọn luật có đường dẫn DÀI hơn,
   * nên `allow` này thắng `disallow: /api` mà REST API vẫn bị chặn.
   */
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/api/media/file/'],
      disallow: ['/admin', '/api'],
    },
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}
