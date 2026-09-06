import { getRequestLocale } from '@/lib/requestLocale'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageBody } from '@/components/pages/PageBody'
import { PageHero } from '@/components/pages/PageHero'
import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import { JsonLd, breadcrumbJsonLd } from '@/components/seo/JsonLd'
import { t } from '@/lib/i18n'
import { localeAlternates, ogImages, ogLocale } from '@/lib/seo'
import { getServiceBySlug, getSettings } from '@/lib/site'
import styles from './page.module.css'

/**
 * /dich-vu/<slug> — chi tiết một dịch vụ (INTERFACE-W0 §6.2).
 * Slug lạ → notFound() thật (404), không render trang rỗng trả 200.
 */
type Params = { slug: string }

/**
 * Render lúc chạy, không nướng tĩnh lúc build — giống 8 route còn lại.
 *
 * Trước đây route này dựng sẵn bằng `generateStaticParams`. Sai ở hai chỗ: DB lúc
 * build rỗng nên danh sách trả về là mảng rỗng và trang bị nướng cứng ở trạng
 * thái không có dữ liệu; và layout gọi `headers()` để đọc ngôn ngữ, thứ chỉ tồn
 * tại khi có request thật.
 */
export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const locale = await getRequestLocale()
  const [service, settings] = await Promise.all([getServiceBySlug(slug), getSettings(locale)])
  if (!service) return {}

  const title = service.seo?.title || service.name
  const description = service.seo?.description || service.summary || undefined
  const path = `/dich-vu/${service.slug}`
  const images = ogImages(service.seo?.image, settings?.logo)

  return {
    title,
    description,
    alternates: localeAlternates(path, locale),
    openGraph: {
      type: 'website',
      url: path,
      siteName: settings?.siteName || t('seo.siteName'),
      locale: ogLocale(locale),
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

export default async function ServiceDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const service = await getServiceBySlug(slug)
  if (!service) notFound()

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: t('seo.breadcrumb.home'), path: '/' },
          { name: t('nav.services'), path: '/dich-vu' },
          { name: service.name, path: `/dich-vu/${service.slug}` },
        ])}
      />
      <PageHero title={service.name} subtitle={service.summary} icon={service.icon} />

      <Section narrow>
        <PageBody content={service.content} />

        <div className={styles.actions}>
          <Button href="/lien-he">{t('service.cta')}</Button>
          <Button href="/dich-vu" variant="ghost">
            {t('service.backToList')}
          </Button>
        </div>
      </Section>
    </>
  )
}
