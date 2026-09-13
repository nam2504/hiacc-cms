/**
 * Hằng và helper cho lớp SEO kỹ thuật (robots, sitemap, OpenGraph, JSON-LD).
 *
 * AUDIT §5.2 và §5.3: site cũ không có robots.txt/sitemap.xml, không có OG tag
 * lẫn structured data. Đây là chỗ tập trung dữ liệu chung cho cả ba thứ đó,
 * để không nơi nào phải hardcode domain lần nữa.
 */
import { DEFAULT_LOCALE, ENABLED_LOCALES, type LocaleCode } from './locales'
import { mediaUrl } from './site'
import { logger } from './observability/logger'

/**
 * Domain gốc của site. Deploy đổi domain thì đổi biến môi trường, KHÔNG sửa code.
 * Bỏ dấu `/` cuối để mọi chỗ nối chuỗi ra đúng một dấu gạch.
 *
 * ⚠️ Đây là `NEXT_PUBLIC_*`, tức Next thay nó bằng GIÁ TRỊ CỨNG ngay lúc
 * `next build` (xem lib/staging.ts). Set biến lúc `next start` là ĐÃ MUỘN —
 * giá trị đã nằm trong bundle. Phải set TRƯỚC khi build.
 *
 * Quên set thì mọi URL tuyệt đối — canonical, hreflang, sitemap, og:url,
 * JSON-LD — đều là `localhost:3000`, và Google nuốt nguyên như vậy. Đây là hỏng
 * IM LẶNG: site vẫn lên, mọi trang vẫn 200, chỉ có SEO chết. Nên phải kêu.
 */
const FALLBACK_SITE_URL = 'http://localhost:3000'

if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_SITE_URL) {
  logger.warn(
    '[seo] THIẾU NEXT_PUBLIC_SITE_URL — canonical, sitemap, og:url và JSON-LD sẽ ' +
      `phát "${FALLBACK_SITE_URL}" ra ngoài. Biến này bị nướng cứng lúc \`next build\`, ` +
      'nên phải set TRƯỚC khi build, không phải lúc chạy.',
  )
}

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_SITE_URL).replace(/\/+$/, '')

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

/* ------------------------------------------------------------------ *
 * SEO đa ngôn ngữ
 *
 * Vì sao gom vào một chỗ: canonical + hreflang + og:locale phải NHẤT QUÁN
 * trên cả 12 trang. Trước đây mỗi trang tự khai `alternates: { canonical: path }`
 * bằng đường dẫn tiếng Việt trần, nên bản `/en` khai canonical trỏ về bản tiếng
 * Việt — Google hiểu đó là "trang này trùng bản kia, đừng chỉ mục tôi" và bỏ
 * toàn bộ nhánh /en khỏi kết quả tìm kiếm. Kiểu lỗi này chỉ lộ ra khi đã mất
 * thứ hạng, nên nó phải được tính một lần ở đây chứ không lặp lại 12 lần.
 * ------------------------------------------------------------------ */

/**
 * Đường dẫn nội bộ theo ngôn ngữ: tiếng Việt (mặc định) giữ nguyên đường dẫn
 * gốc, các ngôn ngữ khác thêm tiền tố `/<code>` — đúng quy ước mà middleware
 * cắt ra khi rewrite.
 *
 * Giữ độc lập với `localizedHref` trong nav.ts (dùng cho link trong UI) vì hai
 * chỗ có vòng đời khác nhau; hợp nhất là việc của một thay đổi riêng.
 */
export function localePath(path: string, locale: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`
  if (locale === DEFAULT_LOCALE) return clean
  return clean === '/' ? `/${locale}` : `/${locale}${clean}`
}

/** Thẻ `og:locale` theo chuẩn OpenGraph (ngôn ngữ_VÙNG), không phải mã ISO trần. */
const OG_LOCALE: Record<string, string> = {
  vi: 'vi_VN',
  en: 'en_US',
  zh: 'zh_CN',
  ko: 'ko_KR',
}

export function ogLocale(locale: string): string {
  return OG_LOCALE[locale] || OG_LOCALE[DEFAULT_LOCALE]
}

/**
 * Bảng hreflang cho một đường dẫn: mọi ngôn ngữ đang bật + `x-default`.
 *
 * `x-default` trỏ bản tiếng Việt vì đó là ngôn ngữ mặc định của site — nó là
 * trang Google phục vụ cho khách mà không ngôn ngữ nào khớp.
 */
export function hreflangLanguages(path: string): Record<string, string> {
  const languages: Record<string, string> = {}
  for (const code of ENABLED_LOCALES) {
    languages[code] = absoluteUrl(localePath(path, code))
  }
  languages['x-default'] = absoluteUrl(localePath(path, DEFAULT_LOCALE))
  return languages
}

/**
 * Khối `alternates` hoàn chỉnh cho `metadata` của một trang.
 *
 * `path` là đường dẫn KHÔNG tiền tố (`/gioi-thieu`), `locale` là ngôn ngữ đang
 * dựng. Canonical trỏ đúng bản đang xem — bản `/en` tự trỏ về `/en`, không trỏ
 * về bản tiếng Việt.
 */
export function localeAlternates(path: string, locale: LocaleCode) {
  return {
    canonical: absoluteUrl(localePath(path, locale)),
    languages: hreflangLanguages(path),
  }
}
