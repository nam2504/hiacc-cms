import type { Metadata } from 'next'
import { Container } from '@/components/ui/Container'
import { CategoryGroups } from '@/components/news/CategoryGroups'
import { EmptyState } from '@/components/news/EmptyState'
import { PageHero } from '@/components/news/PageHero'
import { createTranslator } from '@/lib/i18n'
import { localeAlternates, localePath } from '@/lib/seo'
import { getCategories } from '@/lib/site'
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
export const dynamic = 'force-dynamic'

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
  const categories = await getCategories(locale)

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
            <CategoryGroups categories={categories} />
          ) : (
            <EmptyState
              title={t('news.categories.empty.title')}
              body={t('news.categories.empty.body')}
              actionHref="/"
              actionLabel={t('common.backToHome')}
            />
          )}
        </Container>
      </div>
    </>
  )
}
