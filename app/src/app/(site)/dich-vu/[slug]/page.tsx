import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageBody } from '@/components/pages/PageBody'
import { PageHero } from '@/components/pages/PageHero'
import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import { JsonLd, breadcrumbJsonLd } from '@/components/seo/JsonLd'
import { t } from '@/lib/i18n'
import { ogImages } from '@/lib/seo'
import { getServiceBySlug, getServices, getSettings } from '@/lib/site'
import styles from './page.module.css'

/**
 * /dich-vu/<slug> — chi tiết một dịch vụ (INTERFACE-W0 §6.2).
 * Slug lạ → notFound() thật (404), không render trang rỗng trả 200.
 */
type Params = { slug: string }

/**
 * Dựng sẵn 7 dịch vụ lúc build — số lượng nhỏ và gần như không đổi.
 * Dịch vụ khách thêm sau này vẫn chạy được nhờ dynamicParams mặc định (= true).
 */
export async function generateStaticParams(): Promise<Params[]> {
  const services = await getServices()
  return services.map((service) => ({ slug: service.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const [service, settings] = await Promise.all([getServiceBySlug(slug), getSettings()])
  if (!service) return {}

  const title = service.seo?.title || service.name
  const description = service.seo?.description || service.summary || undefined
  const path = `/dich-vu/${service.slug}`
  const images = ogImages(service.seo?.image, settings?.logo)

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      url: path,
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
