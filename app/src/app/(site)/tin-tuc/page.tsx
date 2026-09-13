import type { Metadata } from 'next'
import { Container } from '@/components/ui/Container'
import { EmptyState } from '@/components/news/EmptyState'
import { PageHero } from '@/components/news/PageHero'
import { Pagination } from '@/components/news/Pagination'
import { FeaturedPost } from '@/components/news/FeaturedPost'
import { PostGrid } from '@/components/news/PostGrid'
import { readPage, type SearchParams } from '@/components/news/params'
import { createTranslator } from '@/lib/i18n'
import { DEFAULT_LOCALE } from '@/lib/locales'
import { localizedHref } from '@/lib/nav'
import { localeAlternates, localePath } from '@/lib/seo'
import { getPosts } from '@/lib/site'
import styles from './page.module.css'
import { getRequestLocale } from '@/lib/requestLocale'

const PER_PAGE = 9

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  const t = createTranslator(locale)
  return {
    title: t('news.list.title'),
    description: t('news.list.subtitle'),
    // Thiếu dòng này thì trang kế thừa canonical '/' của layout: Google coi
    // đây là bản sao trang chủ và bỏ cả nhánh VI lẫn EN khỏi chỉ mục.
    alternates: localeAlternates('/tin-tuc', locale),
    // Không khai thì og:url kế thừa '/' của layout, tức trang /en/tin-tuc chia sẻ
    // lên Facebook/Zalo ra preview trang chủ tiếng Việt.
    openGraph: { url: localePath('/tin-tuc', locale) },
  }
}

/**
 * /tin-tuc — danh sách bài viết đã xuất bản, 9 bài/trang.
 * getPosts() đã lọc _status='published' và tự nuốt lỗi DB (trả docs rỗng),
 * nên DB hỏng thì ra trạng thái rỗng chứ không phải 500.
 */
export default async function NewsListPage({ searchParams }: { searchParams: SearchParams }) {
  const locale = await getRequestLocale()
  const t = createTranslator(locale)
  const params = await searchParams
  const page = readPage(params.page)
  const { docs, totalPages } = await getPosts({ page, limit: PER_PAGE, locale })

  const featured = page === 1 ? docs[0] : null
  const rest = featured ? docs.slice(1) : docs

  return (
    <>
      <PageHero
        title={t('news.list.title')}
        description={t('news.list.subtitle')}
        crumbs={[{ label: t('news.list.title') }]}
      />

      <div className={styles.body}>
        <Container>
          {docs.length > 0 ? (
            <>
              {/* Bài mới nhất lên khối nổi bật, phần còn lại xuống lưới — chỉ ở
                  trang 1: từ trang 2 trở đi mọi bài đều cũ, đôn một bài lên làm
                  "nổi bật" là sai nghĩa. */}
              {featured ? <FeaturedPost post={featured} /> : null}
              {rest.length > 0 ? (
                <>
                  <h2 className={styles.gridTitle}>{t('news.list.latest')}</h2>
                  <PostGrid posts={rest} />
                </>
              ) : null}
              <Pagination basePath="/tin-tuc" page={page} totalPages={totalPages} />
            </>
          ) : (
            <EmptyState
              title={t('news.empty.title')}
              body={t('news.empty.body')}
              actionHref={localizedHref('/chuyen-muc', locale, DEFAULT_LOCALE)}
              actionLabel={t('news.empty.browseCategories')}
            />
          )}
        </Container>
      </div>
    </>
  )
}
