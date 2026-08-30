import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageBody } from '@/components/pages/PageBody'
import { PageHero } from '@/components/pages/PageHero'
import { Section } from '@/components/ui/Section'
import { JsonLd, breadcrumbJsonLd } from '@/components/seo/JsonLd'
import { t } from '@/lib/i18n'
import { ogImages } from '@/lib/seo'
import { getPageBySlug, getSettings } from '@/lib/site'

/**
 * /gioi-thieu — trang tĩnh đọc từ collection `pages`, slug 'gioi-thieu'
 * (INTERFACE-W0 §6.2: trang tĩnh ăn route `/<slug>`).
 *
 * Khách xoá bản ghi trong admin → notFound() thay vì trang trắng.
 */
const SLUG = 'gioi-thieu'

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPageBySlug(SLUG), getSettings()])
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
  const page = await getPageBySlug(SLUG)
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
    </>
  )
}
