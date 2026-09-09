import type { Metadata } from 'next'
import { ContactChannels } from '@/components/pages/ContactChannels'
import { ContactForm } from '@/components/contact/ContactForm'
import { BranchList } from '@/components/pages/BranchList'
import { BranchMap } from '@/components/map/BranchMap'
import { ContactInfo } from '@/components/pages/ContactInfo'
import { PageBody } from '@/components/pages/PageBody'
import { PageHero } from '@/components/pages/PageHero'
import { Section } from '@/components/ui/Section'
import { createTranslator } from '@/lib/i18n'
import { localeAlternates, localePath, ogImages, ogLocale } from '@/lib/seo'
import { getBranches, getPageBySlug, getSettings } from '@/lib/site'
import { getServiceTree } from '@/lib/serviceTree'
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
  const tr = createTranslator(locale)
  // Khác các trang khác: KHÔNG return {} khi thiếu bản ghi `pages` — trang này vẫn
  // render bằng hotline + chi nhánh, nên metadata cũng phải đứng được với page = null.
  const [page, settings] = await Promise.all([getPageBySlug(SLUG, locale), getSettings(locale)])

  const title = page?.seo?.title || page?.title || tr('nav.contact')
  const description = page?.seo?.description || undefined
  const images = ogImages(page?.seo?.image, page?.heroImage, settings?.logo)

  return {
    title,
    description,
    alternates: localeAlternates(`/${SLUG}`, locale),
    openGraph: {
      type: 'website',
      // Theo ngôn ngữ, cùng lý do với canonical ở `alternates` ngay trên.
      url: localePath(`/${SLUG}`, locale),
      siteName: settings?.siteName || tr('seo.siteName'),
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
  // <ContactForm> là client component → locale phải đi xuống qua props.
  const tr = createTranslator(locale)
  const [page, settings, branches, tree] = await Promise.all([
    getPageBySlug(SLUG, locale),
    getSettings(locale),
    getBranches(locale),
    getServiceTree(locale),
  ])
  const fieldOfInterestOptions = tree.map((group) => ({ value: group.title, label: group.title }))
  // Bản đồ cạnh thông tin trụ sở: chi nhánh đầu tiên khách đã điền mapUrl.
  const headOfficeMap = branches.find((branch) => Boolean(branch.mapUrl)) ?? null

  return (
    <>
      <PageHero
        title={page?.title || tr('nav.contact')}
        subtitle={page?.seo?.description || tr('contact.subtitle')}
        image={page?.heroImage}
      />

      <ContactChannels settings={settings} />

      {/*
        Bố cục 2 cột theo Liên hệ.png: cột TRÁI là thông tin trụ sở + bản đồ,
        cột PHẢI là form gửi yêu cầu. Bản trước để form chung cột với PageBody
        nên form tụt xuống dưới phần nội dung, không đứng cạnh trụ sở như thiết kế.
        Bản đồ trụ sở lấy từ chi nhánh đầu tiên có mapUrl — chưa chi nhánh nào có
        thì BranchMap trả null và cột trái chỉ còn thông tin, không hở khung rỗng.
      */}
      <Section>
        <div className={styles.columns}>
          <div className={styles.info}>
            <ContactInfo settings={settings} />
            {headOfficeMap ? (
              <BranchMap
                mapUrl={headOfficeMap.mapUrl}
                city={headOfficeMap.city}
                locale={locale}
              />
            ) : null}
            <PageBody content={page?.content} fallback={false} />
          </div>

          <div className={styles.body}>
            <ContactForm locale={locale} fieldOfInterestOptions={fieldOfInterestOptions} />
          </div>
        </div>
      </Section>

      <Section tone="soft" title={tr('contact.branches.title')} subtitle={tr('contact.branches.subtitle')}>
        <BranchList branches={branches} />
      </Section>
    </>
  )
}
