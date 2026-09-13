import type { Metadata } from 'next'
import { Container } from '@/components/ui/Container'
import { CategoryGroups } from '@/components/news/CategoryGroups'
import { EmptyState } from '@/components/news/EmptyState'
import { PageHero } from '@/components/news/PageHero'
import { createTranslator } from '@/lib/i18n'
import { DEFAULT_LOCALE } from '@/lib/locales'
import { localizedHref } from '@/lib/nav'
import { localeAlternates, localePath } from '@/lib/seo'
import { getCategories, getPostCountsByCategory } from '@/lib/site'
import styles from './page.module.css'
import { getRequestLocale } from '@/lib/requestLocale'

/**
 * Trang này đọc dữ liệu từ DB → PHẢI dynamic.
 *
 * Next mặc định prerender trang không có searchParams/params thành HTML tĩnh ngay
 * trong `next build`. Lúc đó DB còn TRỐNG (image build trước khi có volume), nên
 * mọi truy vấn trả rỗng và kết quả rỗng đó bị nướng cứng vào image — chạy thật
 * vẫn phục vụ lại file đó chứ không gọi lại code. Đã đo trên staging: /chuyen-muc
 * trả HTTP 200 nhưng 0 bài viết, 0 dịch vụ, 0 ảnh; riêng trang gọi notFound()
 * còn bị đóng băng luôn HTTP 404 và ISR cũng không gỡ được.
 *
 * Nguồn dữ liệu ở đây là danh sách chuyên mục.
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

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  const t = createTranslator(locale)
  return {
    title: t('news.categories.title'),
    description: t('news.categories.subtitle'),
    // Thiếu dòng này thì trang kế thừa canonical '/' của layout: Google coi
    // đây là bản sao trang chủ và bỏ cả nhánh VI lẫn EN khỏi chỉ mục.
    alternates: localeAlternates('/chuyen-muc', locale),
    // Không khai thì og:url kế thừa '/' của layout, tức trang /en/chuyen-muc chia sẻ
    // lên Facebook/Zalo ra preview trang chủ tiếng Việt.
    openGraph: { url: localePath('/chuyen-muc', locale) },
  }
}

/**
 * /chuyen-muc — 12 chuyên mục chia 2 nhóm theo field `group`.
 * categories KHÔNG bật drafts (INTERFACE §6.1) nên không phải lọc _status.
 */
export default async function CategoryListPage() {
  const locale = await getRequestLocale()
  const t = createTranslator(locale)
  // Hai truy vấn độc lập → chạy song song, đừng để chúng nối đuôi nhau.
  const [categories, postCounts] = await Promise.all([
    getCategories(locale),
    getPostCountsByCategory(locale),
  ])

  return (
    <>
      <PageHero
        title={t('news.categories.title')}
        description={t('news.categories.subtitle')}
        crumbs={[{ label: t('news.categories.title') }]}
      />

      <div className={styles.body}>
        <Container>
          {categories.length > 0 ? (
            <CategoryGroups categories={categories} postCounts={postCounts} />
          ) : (
            <EmptyState
              title={t('news.categories.empty.title')}
              body={t('news.categories.empty.body')}
              actionHref={localizedHref('/', locale, DEFAULT_LOCALE)}
              actionLabel={t('common.backToHome')}
            />
          )}
        </Container>
      </div>
    </>
  )
}
