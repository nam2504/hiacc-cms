import type { Metadata } from 'next'
import { Be_Vietnam_Pro } from 'next/font/google'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { StagingBanner } from '@/components/layout/StagingBanner'
import { brandStyle, footerStyle } from '@/lib/brandStyle'
import { createTranslator } from '@/lib/i18n'
import { getRequestLocale } from '@/lib/requestLocale'
import { localePath, ogImages, SITE_URL } from '@/lib/seo'
import { isStaging } from '@/lib/staging'
import { getSettings } from '@/lib/site'
import { getServiceTree } from '@/lib/serviceTree'
import { TENANT } from '@/config/tenant'
import '@/styles/tokens.css'
import '@/styles/globals.css'

/**
 * Layout của phần public. Header/Footer dựng ở đây một lần, mọi trang con
 * (W1–W3, W5–W7) chỉ render phần nội dung — KHÔNG tự dựng lại header/footer.
 *
 * Site cũ nạp 5 họ font Google (AUDIT §5.7) làm site nặng. Ở đây đúng 1 họ,
 * self-host qua next/font nên không có request sang fonts.gstatic lúc chạy.
 */
const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-be-vietnam-pro',
})

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  const settings = await getSettings(locale)
  /**
   * `siteName` trong CMS KHÔNG localized (Settings.ts:39) — một giá trị dùng chung
   * cho cả hai ngôn ngữ. Nên khi khách bỏ trống, tên site phải dựng theo locale từ
   * chuỗi i18n `seo.siteName` ('Kế toán {brand}' / '{brand} Accounting') với
   * {brand} = tên tenant, thay vì lấy thẳng TENANT.name.
   *
   * Trước 09/09 dòng này là `brandName(settings?.siteName) || t('seo.siteName')`.
   * brandName() đã tự trả TENANT.name khi rỗng nên vế `||` không bao giờ chạy:
   * trang /en hiện tiêu đề 'Kế toán HiACC' dù bản dịch EN đã có sẵn (khách báo).
   */
  const siteName =
    settings?.siteName?.trim() ||
    createTranslator(locale)('seo.siteName', { brand: TENANT.name })
  const description = settings?.tagline || undefined
  const images = ogImages(settings?.logo)

  /**
   * `metadataBase` cho phép trang con khai canonical / ảnh OG bằng đường dẫn
   * tương đối mà Next tự nối thành URL tuyệt đối — Facebook và Zalo chỉ đọc được
   * URL tuyệt đối (AUDIT §5.3).
   */
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: siteName, template: `%s | ${siteName}` },
    description,
    alternates: { canonical: '/' },
    /**
     * Bản nháp: cấm đánh chỉ mục ở tầng thẻ meta. Đây là lớp chặn thật —
     * robots.txt chỉ xin bot đừng bò, còn `noindex` mới giữ trang khỏi kết quả
     * tìm kiếm kể cả khi bot đã vào qua link người khác chia sẻ.
     * Bản production không đặt field này, để Next giữ mặc định (cho index).
     */
    ...(isStaging() ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      type: 'website',
      siteName,
      locale: locale === 'vi' ? 'vi_VN' : 'en_US',
      // Phải theo ngôn ngữ: trang /en khai og:url tiếng Việt thì chia sẻ lên
      // Facebook/Zalo ra preview bản VI, và đá nhau với canonical /en của chính nó.
      url: localePath('/', locale),
      title: siteName,
      description,
      images,
    },
    twitter: {
      card: images.length > 0 ? 'summary_large_image' : 'summary',
      title: siteName,
      description,
      images,
    },
  }
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  // Một lần fetch cho cả layout — trang con không phải gọi lại
  const locale = await getRequestLocale()
  // `tree` vẫn cần cho Header. Footer 4 cột theo Figma không còn khối "Bài viết
  // gần đây" nên bỏ luôn truy vấn getRecentPosts — mỗi trang tiết kiệm 1 query.
  const [settings, tree] = await Promise.all([getSettings(locale), getServiceTree(locale)])
  const tr = createTranslator(locale)

  // Màu thương hiệu đè lúc chạy: Settings (khách sửa trong /admin) → tenant.
  // Nhờ vậy field "Màu chủ đạo" có tác dụng thật, không cần build lại.
  const brandCss = brandStyle(settings?.primaryColor) + footerStyle(settings?.footerBg)

  return (
    <html lang={locale} className={beVietnamPro.variable}>
      <head>{brandCss ? <style>{brandCss}</style> : null}</head>
      <body>
        <a className="skip-link" href="#main-content">
          {tr('nav.skipToContent')}
        </a>
        <StagingBanner />
        <Header settings={settings} tree={tree} locale={locale} />
        <main id="main-content">{children}</main>
        <Footer settings={settings} />
      </body>
    </html>
  )
}
