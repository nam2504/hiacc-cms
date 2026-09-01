import type { Metadata } from 'next'
import { PageBody } from '@/components/pages/PageBody'
import { PageHero } from '@/components/pages/PageHero'
import { ServiceGrid } from '@/components/pages/ServiceGrid'
import { Section } from '@/components/ui/Section'
import { t } from '@/lib/i18n'
import { getPageBySlug, getServices } from '@/lib/site'

/**
 * Trang này đọc dữ liệu từ DB → PHẢI dynamic.
 *
 * Next mặc định prerender trang không có searchParams/params thành HTML tĩnh ngay
 * trong `next build`. Lúc đó DB còn TRỐNG (image build trước khi có volume), nên
 * mọi truy vấn trả rỗng và kết quả rỗng đó bị nướng cứng vào image — chạy thật
 * vẫn phục vụ lại file đó chứ không gọi lại code. Đã đo trên staging: /dich-vu
 * trả HTTP 200 nhưng 0 bài viết, 0 dịch vụ, 0 ảnh; riêng trang gọi notFound()
 * còn bị đóng băng luôn HTTP 404 và ISR cũng không gỡ được.
 *
 * Nguồn dữ liệu ở đây là danh sách dịch vụ.
 */
export const dynamic = 'force-dynamic'

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
