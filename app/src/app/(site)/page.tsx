import type { Metadata } from 'next'
import { About } from '@/components/home/About'
import { Branches } from '@/components/home/Branches'
import { CallToAction } from '@/components/home/CallToAction'
import { Hero } from '@/components/home/Hero'
import { Knowledge } from '@/components/home/Knowledge'
import { Services } from '@/components/home/Services'
import { Social } from '@/components/home/Social'
import { Stats } from '@/components/home/Stats'
import { JsonLd, accountingServiceJsonLd } from '@/components/seo/JsonLd'
import { t } from '@/lib/i18n'
import { absoluteMediaUrl, ogImages } from '@/lib/seo'
import { getBranches, getCategories, getServices, getSettings } from '@/lib/site'

/**
 * Trang này đọc dữ liệu từ DB → PHẢI dynamic.
 *
 * Next mặc định prerender trang không có searchParams/params thành HTML tĩnh ngay
 * trong `next build`. Lúc đó DB còn TRỐNG (image build trước khi có volume), nên
 * mọi truy vấn trả rỗng và kết quả rỗng đó bị nướng cứng vào image — chạy thật
 * vẫn phục vụ lại file đó chứ không gọi lại code. Đã đo trên staging: /
 * trả HTTP 200 nhưng 0 bài viết, 0 dịch vụ, 0 ảnh; riêng trang gọi notFound()
 * còn bị đóng băng luôn HTTP 404 và ISR cũng không gỡ được.
 *
 * Nguồn dữ liệu ở đây là trang chủ (dịch vụ, chuyên mục, chi nhánh, cài đặt).
 */
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()
  const siteName = settings?.siteName || t('seo.siteName')
  const description = settings?.tagline || settings?.aboutShort || undefined
  const images = ogImages(settings?.logo)

  // `title.absolute` để trang chủ không bị nối template "%s | Tên site" thành lặp tên.
  return {
    title: { absolute: settings?.tagline ? `${siteName} — ${t('seo.home.title')}` : siteName },
    description,
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      url: '/',
      siteName,
      locale: 'vi_VN',
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

/**
 * Trang chủ — 9 khối theo AUDIT §3.
 * Khối 1 (top bar) và 9 (footer) do layout của W0 dựng, ở đây chỉ khối 2–8.
 *
 * Mọi helper trong site.ts đã tự nuốt lỗi DB (trả null / mảng rỗng), nên khi DB
 * hỏng thì khối tương ứng tự ẩn, trang vẫn trả 200 thay vì sập cả site.
 */
export default async function HomePage() {
  const [settings, services, branches, categories] = await Promise.all([
    getSettings(),
    getServices(),
    getBranches(),
    getCategories(),
  ])

  /**
   * Dữ liệu có cấu trúc lấy TOÀN BỘ từ Settings + Branches — khách sửa trong admin
   * là schema đổi theo, không có chuỗi nào hardcode ở đây (AUDIT §5.5).
   */
  const jsonLd = accountingServiceJsonLd({
    siteName: settings?.siteName || t('seo.siteName'),
    description: settings?.tagline || settings?.aboutShort,
    logoUrl: absoluteMediaUrl(settings?.logo),
    hotlines: [settings?.hotline, settings?.hotline2],
    email: settings?.email,
    address: settings?.headOfficeAddress,
    taxCode: settings?.taxCode,
    sameAs: [settings?.facebook, settings?.tiktok, settings?.youtube, settings?.twitter],
    branches: branches.map((branch) => ({
      city: branch.city,
      address: branch.address,
      phone: branch.phone,
      email: branch.email,
    })),
  })

  return (
    <>
      <JsonLd data={jsonLd} />
      <Hero settings={settings} />
      <Stats settings={settings} />
      <About settings={settings} />
      <Services services={services} settings={settings} />
      <Branches branches={branches} settings={settings} />
      <Knowledge categories={categories} settings={settings} />
      {/* Social đứng sau Knowledge: Branches và Knowledge là hai khối chứng minh
          năng lực, chèn dải mạng xã hội vào giữa cắt ngang mạch đó. */}
      <Social settings={settings} />
      <CallToAction settings={settings} />
    </>
  )
}
