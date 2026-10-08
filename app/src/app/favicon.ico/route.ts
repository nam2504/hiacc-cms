import { absoluteMediaUrl } from '@/lib/seo'
import { getSettings } from '@/lib/site'

/**
 * /favicon.ico — chuyển hướng sang favicon khách đặt trong admin (Settings → Thương hiệu).
 *
 * Trình duyệt và bot (Google, Zalo…) vẫn gõ thẳng `/favicon.ico` dù trang đã khai
 * `<link rel="icon">`; trước 08/10 đường này trả 404, góp phần làm Google không có
 * icon cho kết quả tìm kiếm. Icon là ảnh upload nên không đặt được file tĩnh
 * `app/favicon.ico` — đổi trong admin là phải đổi theo.
 *
 * ⚠️ Giống robots.ts: PHẢI nằm ở `src/app/`, không để trong `(site)` — catch-all
 * `(site)/[...slug]` sẽ nuốt mất route này.
 */
export const dynamic = 'force-dynamic'

export async function GET() {
  const favicon = absoluteMediaUrl((await getSettings())?.favicon)
  if (!favicon) return new Response(null, { status: 404 })

  // 302 chứ không 301/308: khách đổi icon trong admin thì bot phải theo được ngay.
  return new Response(null, {
    status: 302,
    headers: { Location: favicon, 'Cache-Control': 'public, max-age=3600' },
  })
}
