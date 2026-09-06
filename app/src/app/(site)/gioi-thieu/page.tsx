import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageBody } from '@/components/pages/PageBody'
import { PageHero } from '@/components/pages/PageHero'
import { CompanyProfile } from '@/components/pages/CompanyProfile'
import { GroupSummary } from '@/components/pages/GroupSummary'
import { Section } from '@/components/ui/Section'
import { JsonLd, breadcrumbJsonLd } from '@/components/seo/JsonLd'
import { t } from '@/lib/i18n'
import { ogImages } from '@/lib/seo'
import { getPageBySlug, getSettings } from '@/lib/site'
import { getServiceTree } from '@/lib/serviceTree'
import { getRequestLocale } from '@/lib/requestLocale'

/**
 * Trang này đọc dữ liệu từ DB → PHẢI dynamic.
 *
 * Next mặc định prerender trang không có searchParams/params thành HTML tĩnh ngay
 * trong `next build`. Lúc đó DB còn TRỐNG (image build trước khi có volume), nên
 * mọi truy vấn trả rỗng và kết quả rỗng đó bị nướng cứng vào image — chạy thật
 * vẫn phục vụ lại file đó chứ không gọi lại code. Đã đo trên staging: /gioi-thieu
 * trả HTTP 200 nhưng 0 bài viết, 0 dịch vụ, 0 ảnh; riêng trang gọi notFound()
 * còn bị đóng băng luôn HTTP 404 và ISR cũng không gỡ được.
 *
 * Nguồn dữ liệu ở đây là trang tĩnh 'gioi-thieu' trong collection `pages`.
 */
export const dynamic = 'force-dynamic'

/**
 * /gioi-thieu — trang tĩnh đọc từ collection `pages`, slug 'gioi-thieu'
 * (INTERFACE-W0 §6.2: trang tĩnh ăn route `/<slug>`).
 *
 * Khách xoá bản ghi trong admin → notFound() thay vì trang trắng.
 */
const SLUG = 'gioi-thieu'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  const [page, settings] = await Promise.all([getPageBySlug(SLUG, locale), getSettings(locale)])
  if (!page) return {}

  const title = page.seo?.title || page.title
  const description = page.seo?.description || undefined
  const images = ogImages(page.seo?.image, page.heroImage, settings?.logo)

  return {
    title,
    description,
    alternates: { canonical: `/${SLUG}` },
    openGraph: {
      type: 'website',
      url: `/${SLUG}`,
      siteName: settings?.siteName || t('seo.siteName'),
      locale: 'vi_VN',
      title,
      description,
      images,
    },
    twitter: {
      card: images.length > 0 ? 'summary_large_image' : 'summary',
      title,
      description,
      images,
    },
  }
}

export default async function GioiThieuPage() {
  const locale = await getRequestLocale()
  const [page, settings, tree] = await Promise.all([
    getPageBySlug(SLUG, locale),
    getSettings(locale),
    getServiceTree(locale),
  ])
  if (!page) notFound()

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: t('seo.breadcrumb.home'), path: '/' },
          { name: page.title, path: `/${SLUG}` },
        ])}
      />
      <PageHero title={page.title} subtitle={page.seo?.description} image={page.heroImage} />
      <Section narrow>
        <PageBody content={page.content} />
      </Section>

      {/* Ba khối theo thiết kế khách 06/09: hồ sơ công ty + nguyên tắc hành nghề,
          rồi tóm tắt các nhóm dịch vụ. Dữ liệu lấy từ Settings và cây, khách sửa
          trong /admin. */}
      <CompanyProfile settings={settings} />
      <GroupSummary tree={tree} />
    </>
  )
}
