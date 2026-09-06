import type { Metadata } from 'next'
import { Be_Vietnam_Pro } from 'next/font/google'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { StagingBanner } from '@/components/layout/StagingBanner'
import { brandStyle } from '@/lib/brandStyle'
import { t } from '@/lib/i18n'
import { DEFAULT_LOCALE } from '@/lib/locales'
import { ogImages, SITE_URL } from '@/lib/seo'
import { isStaging } from '@/lib/staging'
import { getRecentPosts, getSettings } from '@/lib/site'
import { brandName } from '@/config/tenant'
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
  const settings = await getSettings()
  const siteName = brandName(settings?.siteName) || t('seo.siteName')
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
      locale: 'vi_VN',
      url: '/',
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
  const [settings, recentPosts] = await Promise.all([getSettings(), getRecentPosts(3)])

  // Màu thương hiệu đè lúc chạy: Settings (khách sửa trong /admin) → tenant.
  // Nhờ vậy field "Màu chủ đạo" có tác dụng thật, không cần build lại.
  const brandCss = brandStyle(settings?.primaryColor)

  return (
    <html lang={DEFAULT_LOCALE} className={beVietnamPro.variable}>
      <head>{brandCss ? <style>{brandCss}</style> : null}</head>
      <body>
        <a className="skip-link" href="#main-content">
          {t('nav.skipToContent')}
        </a>
        <StagingBanner />
        <Header settings={settings} />
        <main id="main-content">{children}</main>
        <Footer settings={settings} recentPosts={recentPosts} />
      </body>
    </html>
  )
}
