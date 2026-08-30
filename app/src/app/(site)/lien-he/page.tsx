import type { Metadata } from 'next'
import { ContactForm } from '@/components/contact/ContactForm'
import { BranchList } from '@/components/pages/BranchList'
import { ContactInfo } from '@/components/pages/ContactInfo'
import { PageBody } from '@/components/pages/PageBody'
import { PageHero } from '@/components/pages/PageHero'
import { Section } from '@/components/ui/Section'
import { t } from '@/lib/i18n'
import { ogImages } from '@/lib/seo'
import { getBranches, getPageBySlug, getSettings } from '@/lib/site'
import styles from './page.module.css'

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
  // Khác các trang khác: KHÔNG return {} khi thiếu bản ghi `pages` — trang này vẫn
  // render bằng hotline + chi nhánh, nên metadata cũng phải đứng được với page = null.
  const [page, settings] = await Promise.all([getPageBySlug(SLUG), getSettings()])

  const title = page?.seo?.title || page?.title || t('nav.contact')
  const description = page?.seo?.description || undefined
  const images = ogImages(page?.seo?.image, page?.heroImage, settings?.logo)

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

export default async function LienHePage() {
  const [page, settings, branches] = await Promise.all([
    getPageBySlug(SLUG),
    getSettings(),
    getBranches(),
  ])

  return (
    <>
      <PageHero
        title={page?.title || t('nav.contact')}
        subtitle={page?.seo?.description || t('contact.subtitle')}
        image={page?.heroImage}
      />

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
