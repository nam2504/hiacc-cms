import type { Metadata } from 'next'
import { ContactChannels } from '@/components/pages/ContactChannels'
import { ContactForm } from '@/components/contact/ContactForm'
import { BranchList } from '@/components/pages/BranchList'
import { ContactInfo } from '@/components/pages/ContactInfo'
import { PageBody } from '@/components/pages/PageBody'
import { PageHero } from '@/components/pages/PageHero'
import { Section } from '@/components/ui/Section'
import { t } from '@/lib/i18n'
import { localeAlternates, ogImages, ogLocale } from '@/lib/seo'
import { getBranches, getPageBySlug, getSettings } from '@/lib/site'
import styles from './page.module.css'
import { getRequestLocale } from '@/lib/requestLocale'

/**
 * Trang này đọc dữ liệu từ DB → PHẢI dynamic.
 *
 * Next mặc định prerender trang không có searchParams/params thành HTML tĩnh ngay
 * trong `next build`. Lúc đó DB còn TRỐNG (image build trước khi có volume), nên
 * mọi truy vấn trả rỗng và kết quả rỗng đó bị nướng cứng vào image — chạy thật
 * vẫn phục vụ lại file đó chứ không gọi lại code. Đã đo trên staging: /lien-he
 * trả HTTP 200 nhưng 0 bài viết, 0 dịch vụ, 0 ảnh; riêng trang gọi notFound()
 * còn bị đóng băng luôn HTTP 404 và ISR cũng không gỡ được.
 *
 * Nguồn dữ liệu ở đây là trang liên hệ + danh sách chi nhánh.
 */
export const dynamic = 'force-dynamic'

/**
 * /lien-he — thông tin liên hệ + mạng lưới chi nhánh.
 *
 * Form liên hệ (gói W7) nằm ở cột phải của khối .columns bên dưới:
 * <ContactForm> là client component, gửi qua Server Action ở ./actions.ts.
 * Trang này vẫn là server component.
 *
 * Không notFound() khi thiếu trang tĩnh 'lien-he': hotline và địa chỉ chi nhánh
 * mới là thứ khách cần, xoá nhầm bản ghi `pages` không được làm mất luôn.
 */
const SLUG = 'lien-he'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  // Khác các trang khác: KHÔNG return {} khi thiếu bản ghi `pages` — trang này vẫn
  // render bằng hotline + chi nhánh, nên metadata cũng phải đứng được với page = null.
  const [page, settings] = await Promise.all([getPageBySlug(SLUG, locale), getSettings(locale)])

  const title = page?.seo?.title || page?.title || t('nav.contact')
  const description = page?.seo?.description || undefined
  const images = ogImages(page?.seo?.image, page?.heroImage, settings?.logo)

  return {
    title,
    description,
    alternates: localeAlternates(`/${SLUG}`, locale),
    openGraph: {
      type: 'website',
      url: `/${SLUG}`,
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

export default async function LienHePage() {
  const locale = await getRequestLocale()
  const [page, settings, branches] = await Promise.all([
    getPageBySlug(SLUG, locale),
    getSettings(locale),
    getBranches(locale),
  ])

  return (
    <>
      <PageHero
        title={page?.title || t('nav.contact')}
        subtitle={page?.seo?.description || t('contact.subtitle')}
        image={page?.heroImage}
      />

      <ContactChannels settings={settings} />

      <Section>
        <div className={styles.columns}>
          <div className={styles.info}>
            <ContactInfo settings={settings} />
          </div>

          <div className={styles.body}>
            <PageBody content={page?.content} fallback={false} />
            {/* Chỗ dành cho form liên hệ — gói W7 gắn component form vào đây. */}
            <ContactForm />
          </div>
        </div>
      </Section>

      <Section tone="soft" title={t('contact.branches.title')} subtitle={t('contact.branches.subtitle')}>
        <BranchList branches={branches} />
      </Section>
    </>
  )
}
