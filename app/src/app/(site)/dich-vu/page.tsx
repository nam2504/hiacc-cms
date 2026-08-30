import type { Metadata } from 'next'
import { PageBody } from '@/components/pages/PageBody'
import { PageHero } from '@/components/pages/PageHero'
import { ServiceGrid } from '@/components/pages/ServiceGrid'
import { Section } from '@/components/ui/Section'
import { t } from '@/lib/i18n'
import { getPageBySlug, getServices } from '@/lib/site'

/**
 * /dich-vu — danh sách dịch vụ.
 *
 * Phần đầu trang lấy từ trang tĩnh slug 'dich-vu' (khách sửa tiêu đề/mô tả trong
 * admin), lưới thẻ lấy từ collection `services`. KHÔNG notFound() khi thiếu
 * trang tĩnh: danh sách dịch vụ mới là nội dung chính, xoá nhầm bản ghi `pages`
 * không được làm chết cả nhánh /dich-vu/<slug> đang có link ngoài trỏ vào.
 */
const SLUG = 'dich-vu'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug(SLUG)

  return {
    title: page?.seo?.title || page?.title || t('nav.services'),
    description: page?.seo?.description || undefined,
  }
}

export default async function DichVuPage() {
  const [page, services] = await Promise.all([getPageBySlug(SLUG), getServices()])

  return (
    <>
      <PageHero
        title={page?.title || t('nav.services')}
        subtitle={page?.seo?.description || t('services.listSubtitle')}
        image={page?.heroImage}
      />

      <Section>
        <ServiceGrid services={services} />
      </Section>

      {/* Nội dung mô tả thêm của trang tĩnh — chưa nhập thì ẩn hẳn, đã có lưới ở trên rồi */}
      {page?.content && (
        <Section tone="soft" narrow>
          <PageBody content={page.content} fallback={false} />
        </Section>
      )}
    </>
  )
}
