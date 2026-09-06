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

/**
 * Ngôn ngữ khách đã TỰ CHỌN, đọc từ cookie. Trả null khi chưa chọn hoặc khi
 * cookie giữ giá trị rác / ngôn ngữ đã tắt.
 *
 * Phải đọc `.get()` chứ không `.has()`: `.has()` chỉ biết cookie có tồn tại,
 * không biết nó ghi gì. Bản trước dùng `.has()` nên cookie `en` chỉ có tác dụng
 * CHẶN chuyển hướng theo trình duyệt, còn khách vẫn rơi vào tiếng Việt — lựa
 * chọn được lưu nhưng chưa bao giờ được dùng.
 */
function storedLocale(request: NextRequest): string | null {
  const value = request.cookies.get(COOKIE)?.value
  if (!value) return null
  return ENABLED_LOCALES.includes(value as (typeof ENABLED_LOCALES)[number]) ? value : null
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

    /**
     * Chỉ ghi cookie khi khách CHƯA từng chọn ngôn ngữ.
     *
     * Ghi đè vô điều kiện thì khách đang đọc tiếng Việt mà mở một link `/en` —
     * đồng nghiệp gửi, hay bấm từ Google — là bị ghim sang tiếng Anh vĩnh viễn,
     * vì từ đó trang chủ luôn đá sang `/en`. Một cú bấm không phải một quyết định.
     *
     * Điều kiện `!== prefix` cũng không đủ: khách chọn `vi` rồi mở `/en` vẫn khác
     * nhau nên vẫn bị ghi đè. Chỉ khi cookie còn TRỐNG thì đường dẫn mới được coi
     * là ý định. Đổi ngôn ngữ thật đi qua nút chuyển trong menu, và nút đó dẫn
     * tới `/en/...` khi cookie chưa có, hoặc người dùng xoá cookie.
     */
    if (storedLocale(request) === null) {
      response.cookies.set(COOKIE, prefix, { path: '/', maxAge: 60 * 60 * 24 * 365 })
    }
    return response
  }

  // 2. Trang chủ: lựa chọn đã lưu THẮNG Accept-Language; chưa chọn thì theo trình duyệt.
  if (pathname === '/') {
    const chosen = storedLocale(request)
    const locale = chosen ?? pickLocale(request.headers.get('accept-language'))

    if (locale !== DEFAULT_LOCALE) {
      const url = request.nextUrl.clone()
      url.pathname = `/${locale}`
      // 307 chứ không 308: đây là gợi ý theo từng người, không phải trang đã dời
      // vĩnh viễn. 308 bị trình duyệt nhớ, khách không quay lại tiếng Việt được.
      return NextResponse.redirect(url, 307)
    }

    /**
     * Đã chọn tiếng Việt: phục vụ tại chỗ, KHÔNG chuyển hướng, và cũng không
     * ghi lại cookie — giá trị đang đúng rồi.
     */
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
