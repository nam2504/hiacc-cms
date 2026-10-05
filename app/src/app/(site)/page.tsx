import type { Metadata } from 'next'
import { About } from '@/components/home/About'
import { CallToAction } from '@/components/home/CallToAction'
import { ContactForm } from '@/components/contact/ContactForm'
import { Section } from '@/components/ui/Section'
import { Hero } from '@/components/home/Hero'
import { ServiceGroups } from '@/components/home/ServiceGroups'
import { Stats } from '@/components/home/Stats'
import { JsonLd, accountingServiceJsonLd } from '@/components/seo/JsonLd'
import { createTranslator } from '@/lib/i18n'
import { absoluteMediaUrl, localeAlternates, localePath, ogImages, ogLocale } from '@/lib/seo'
import { getBranches, getSettings, siteDisplayName } from '@/lib/site'
import { getNodeImages, getServiceTree } from '@/lib/serviceTree'
import { getRequestLocale } from '@/lib/requestLocale'
import styles from './page.module.css'

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
/**
 * ISR 10 phút thay cho `force-dynamic` (09/09, khách báo click menu chậm).
 * Đo được TTFB 1.0–3.0s vì mỗi click render lại từ đầu + gọi DB. Trang này là
 * nội dung tĩnh theo phiên, không có gì riêng theo người dùng, nên phục vụ bản
 * đã dựng sẵn và dựng lại nền mỗi 600s.
 *
 * Khách sửa trong /admin sẽ thấy chậm nhất sau 10 phút — đánh đổi đã chốt.
 * Vẫn KHÔNG prerender lúc build (build-time DB rỗng sẽ nướng ra trang trắng
 * trả 200): `dynamicParams`/không có generateStaticParams giữ trang dựng theo
 * request đầu tiên rồi mới cache.
 */
export const revalidate = 600

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  const tr = createTranslator(locale)
  const settings = await getSettings(locale)
  const siteName = siteDisplayName(settings, locale)
  const description = settings?.home?.heroTagline || settings?.aboutShort || undefined
  const images = ogImages(settings?.logo)

  // `title.absolute` để trang chủ không bị nối template "%s | Tên site" thành lặp tên.
  return {
    title: { absolute: settings?.home?.heroTagline ? `${siteName} — ${tr('seo.home.title')}` : siteName },
    description,
    alternates: localeAlternates('/', locale),
    openGraph: {
      type: 'website',
      // Theo ngôn ngữ, cùng lý do với canonical ở `alternates` ngay trên.
      url: localePath('/', locale),
      siteName,
      locale: ogLocale(locale),
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
  const locale = await getRequestLocale()
  const [settings, branches, tree] = await Promise.all([
    getSettings(locale),
    getBranches(locale),
    getServiceTree(locale),
  ])

  // Ảnh chỉ nạp cho 5 nhóm cấp cao nhất — đúng số thẻ hiện trên trang chủ.
  const groupImages = await getNodeImages(tree.map((group) => group.id))

  const tr = createTranslator(locale)
  // Cột trái khối "Đăng ký tư vấn" — cùng cách lọc hotline rỗng như ContactInfo.tsx.
  const consultHotlines = [settings?.hotline, settings?.hotline2].filter(
    (v): v is string => typeof v === 'string' && v.trim() !== '',
  )

  /**
   * Dữ liệu có cấu trúc lấy TOÀN BỘ từ Settings + Branches — khách sửa trong admin
   * là schema đổi theo, không có chuỗi nào hardcode ở đây (AUDIT §5.5).
   */
  const jsonLd = accountingServiceJsonLd({
    siteName: siteDisplayName(settings, locale),
    description: settings?.home?.heroTagline || settings?.aboutShort,
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
      {/* Thứ tự khối theo thiết kế khách 06/09 (`Trang chủ.png`):
          hero → strip 3 giá trị → Về công ty → Lĩnh vực hoạt động → dải đỏ CTA.

          Ba khối Chi nhánh / Trung tâm kiến thức / Mạng xã hội đã BỎ khỏi trang
          chủ: không có trong thiết kế mới, và khối Chi nhánh đang hiện 5 dòng
          "Đang cập nhật" vì khách chưa cấp địa chỉ thật. Component vẫn còn trong
          repo, gắn lại được nếu khách muốn. */}
      <Hero settings={settings} />
      <Stats settings={settings} />
      <About settings={settings} />
      <ServiceGroups tree={tree} settings={settings} images={groupImages} />

      {/* Dải đỏ CTA nằm TRƯỚC form tư vấn theo đúng thứ tự thật (REQUIREMENTS-hiacc-v2
          mục A3, video 06/09): ...Lĩnh vực hoạt động → dải đỏ CTA → form tư vấn → footer.
          Trước đây bị đặt sau form do nhầm thứ tự khi ghép khối 8. */}
      <CallToAction settings={settings} />

      {/* Khối 8 theo spec: form tư vấn ngay trên trang chủ, không bắt người đọc
          bấm sang /lien-he mới gửi được yêu cầu. Dùng lại đúng component của
          trang liên hệ — cùng Server Action, cùng chống spam.
          [QC 13/09] Trước đây nhúng thẳng <ContactForm> không có cột trái nên
          xuống 1 cột dọc, dài hơn Trang chủ.png. Cột trái dùng khoá riêng
          (home.consult.*) — khác 'contact.form.title' là tiêu đề của form ở
          cột phải, tránh 2 tiêu đề giống hệt nhau. */}
      <Section id="tu-van" tone="soft">
        <div className={styles.consultColumns}>
          <div className={styles.consultInfo}>
            <p className={styles.consultEyebrow}>{tr('home.consult.eyebrow')}</p>
            <h2 className={styles.consultTitle}>{tr('home.consult.title')}</h2>
            <p className={styles.consultSubtitle}>{tr('home.consult.subtitle')}</p>
            {(consultHotlines.length > 0 || settings?.email) && (
              <p className={styles.consultContact}>
                {consultHotlines.length > 0 && (
                  <span>
                    {tr('common.hotline')}: {consultHotlines.join(' / ')}
                  </span>
                )}
                {settings?.email && (
                  <span>
                    {tr('common.email')}: <a href={`mailto:${settings.email}`}>{settings.email}</a>
                  </span>
                )}
              </p>
            )}
          </div>

          <div className={styles.consultBody}>
            <ContactForm
              locale={locale}
              fieldOfInterestOptions={tree.map((group) => ({ value: group.title, label: group.title }))}
            />
          </div>
        </div>
      </Section>
    </>
  )
}
