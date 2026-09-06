import { NextResponse, type NextRequest } from 'next/server'
import { DEFAULT_LOCALE, ENABLED_LOCALES } from '@/lib/locales'

/**
 * Định tuyến ngôn ngữ.
 *
 * Cách làm: tiếng Việt (mặc định) giữ đường dẫn gốc `/gioi-thieu`, tiếng Anh
 * nằm dưới `/en/gioi-thieu`. Middleware CẮT tiền tố `/en` rồi rewrite về đúng
 * route gốc, kèm header `x-locale` để trang biết đang dựng ngôn ngữ nào.
 *
 * Vì sao rewrite chứ không dựng cây route `[locale]` song song: cả 12 route đều
 * đã có sẵn và dùng chung component. Nhân đôi cây route nghĩa là mỗi lần sửa một
 * trang phải nhớ sửa ở hai chỗ — kiểu lỗi chỉ lộ ra sau vài tháng, khi bản tiếng
 * Anh lặng lẽ tụt lại so với bản tiếng Việt.
 *
 * Chuyển hướng theo trình duyệt CHỈ áp dụng ở trang chủ và chỉ khi khách chưa tự
 * chọn ngôn ngữ. Ở mọi đường dẫn khác thì không: khách nhận link tiếng Việt từ
 * đồng nghiệp mà trình duyệt đặt tiếng Anh sẽ bị đá sang trang khác — link chia
 * sẻ phải mở đúng thứ người gửi nhìn thấy.
 */
const COOKIE = 'NEXT_LOCALE'
const LOCALE_HEADER = 'x-locale'

/** Ngôn ngữ có tiền tố đường dẫn — tức mọi ngôn ngữ trừ mặc định. */
const PREFIXED = ENABLED_LOCALES.filter((code) => code !== DEFAULT_LOCALE)

/** Đọc Accept-Language, trả mã ngôn ngữ đầu tiên mà site đang bật. */
function pickLocale(header: string | null): string {
  if (!header) return DEFAULT_LOCALE

  const ranked = header
    .split(',')
    .map((part) => {
      const [tag, q] = part.trim().split(';q=')
      return { tag: tag.trim().toLowerCase(), q: q ? Number(q) : 1 }
    })
    .filter((item) => item.tag && !Number.isNaN(item.q))
    .sort((a, b) => b.q - a.q)

  for (const item of ranked) {
    // "en-GB" cũng tính là "en" — so khớp phần trước dấu gạch.
    const base = item.tag.split('-')[0]
    if (ENABLED_LOCALES.includes(base as (typeof ENABLED_LOCALES)[number])) return base
  }
  return DEFAULT_LOCALE
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Đường dẫn đã có tiền tố ngôn ngữ: cắt tiền tố, rewrite về route gốc.
  const prefix = PREFIXED.find(
    (code) => pathname === `/${code}` || pathname.startsWith(`/${code}/`),
  )

  if (prefix) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.slice(`/${prefix}`.length) || '/'

    const headers = new Headers(request.headers)
    headers.set(LOCALE_HEADER, prefix)

    const response = NextResponse.rewrite(url, { request: { headers } })
    // Nhớ lựa chọn để lần sau vào trang chủ không bị đá về tiếng Việt.
    response.cookies.set(COOKIE, prefix, { path: '/', maxAge: 60 * 60 * 24 * 365 })
    return response
  }

  // 2. Trang chủ, chưa từng chọn ngôn ngữ: theo trình duyệt.
  if (pathname === '/' && !request.cookies.has(COOKIE)) {
    const locale = pickLocale(request.headers.get('accept-language'))
    if (locale !== DEFAULT_LOCALE) {
      const url = request.nextUrl.clone()
      url.pathname = `/${locale}`
      // 307 chứ không 308: đây là gợi ý theo từng người, không phải trang đã dời
      // vĩnh viễn. 308 bị trình duyệt nhớ, khách không quay lại tiếng Việt được.
      return NextResponse.redirect(url, 307)
    }
  }

  return NextResponse.next()
}

export const config = {
  /**
   * Bỏ qua /admin, /api, file tĩnh và ảnh: middleware không có việc gì ở đó, cho
   * nó chạy chỉ thêm chi phí mỗi request.
   */
  matcher: ['/((?!admin|api|_next/static|_next/image|media|favicon.ico|robots.txt|sitemap.xml).*)'],
}
