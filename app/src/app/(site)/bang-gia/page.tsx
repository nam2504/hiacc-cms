import type { Metadata } from 'next'
import { Container } from '@/components/ui/Container'
import { EmptyState } from '@/components/news/EmptyState'
import { PageHero } from '@/components/news/PageHero'
import { brandName } from '@/config/tenant'
import { createTranslator } from '@/lib/i18n'
import { localizedHref } from '@/lib/nav'
import { DEFAULT_LOCALE } from '@/lib/locales'
import { getRequestLocale } from '@/lib/requestLocale'
import { localeAlternates, localePath, ogImages, ogLocale } from '@/lib/seo'
import { getSettings } from '@/lib/site'

/**
 * /bang-gia — trang giữ chỗ.
 *
 * Vì sao tồn tại: mục "Bảng giá" nằm cố định trên TopBar của 100% trang, cả hai
 * ngôn ngữ, nên người dùng thật bấm vào được. Trước khi có trang này, cú bấm đó
 * rơi thẳng vào 404 (review site 07/09, finding B5).
 *
 * ⚠️ ĐÂY KHÔNG PHẢI TRANG BẢNG GIÁ THẬT. Khách chưa gửi biểu phí (WS-6 T-price),
 * và không được bịa số tiền dịch vụ. Khi có nội dung thật thì thay toàn bộ phần
 * thân trang bên dưới — `generateMetadata` và route giữ nguyên để không mất URL
 * đã nằm trong sitemap.
 *
 * Đọc Settings nên phải dynamic; xem chú thích cùng loại ở /chuyen-muc.
 */
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  const t = createTranslator(locale)
  const settings = await getSettings(locale)
  const title = t('nav.pricing')
  const description = t('pricing.pending.body')

  return {
    title,
    description,
    alternates: localeAlternates('/bang-gia', locale),
    openGraph: {
      type: 'website',
      // Theo ngôn ngữ, cùng lý do với canonical ở `alternates` ngay trên.
      url: localePath('/bang-gia', locale),
      siteName: brandName(settings?.siteName),
      locale: ogLocale(locale),
      title,
      description,
      images: ogImages(settings?.logo),
    },
  }
}

export default async function PricingPage() {
  const locale = await getRequestLocale()
  const t = createTranslator(locale)

  return (
    <>
      <PageHero
        title={t('nav.pricing')}
        crumbs={[{ label: t('seo.breadcrumb.home'), href: localizedHref('/', locale, DEFAULT_LOCALE) }]}
      />
      <Container>
        <EmptyState
          title={t('pricing.pending.title')}
          body={t('pricing.pending.body')}
          actionHref={localizedHref('/lien-he', locale, DEFAULT_LOCALE)}
          actionLabel={t('nav.contact')}
        />
      </Container>
    </>
  )
}
