import type { Metadata } from 'next'
import { Container } from '@/components/ui/Container'
import { EmptyState } from '@/components/news/EmptyState'
import { PageHero } from '@/components/news/PageHero'
import { Pagination } from '@/components/news/Pagination'
import { FeaturedPost } from '@/components/news/FeaturedPost'
import { PostGrid } from '@/components/news/PostGrid'
import { readPage, type SearchParams } from '@/components/news/params'
import { t } from '@/lib/i18n'
import { getPosts } from '@/lib/site'
import styles from './page.module.css'
import { getRequestLocale } from '@/lib/requestLocale'

const PER_PAGE = 9

export function generateMetadata(): Metadata {
  return {
    title: t('news.list.title'),
    description: t('news.list.subtitle'),
  }
}

/**
 * /tin-tuc — danh sách bài viết đã xuất bản, 9 bài/trang.
 * getPosts() đã lọc _status='published' và tự nuốt lỗi DB (trả docs rỗng),
 * nên DB hỏng thì ra trạng thái rỗng chứ không phải 500.
 */
export default async function NewsListPage({ searchParams }: { searchParams: SearchParams }) {
  const locale = await getRequestLocale()
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
                  <h2 className={styles.gridTitle}>Bài mới</h2>
                  <PostGrid posts={rest} />
                </>
              ) : null}
              <Pagination basePath="/tin-tuc" page={page} totalPages={totalPages} />
            </>
          ) : (
            <EmptyState
              title={t('news.empty.title')}
              body={t('news.empty.body')}
              actionHref="/chuyen-muc"
              actionLabel={t('news.empty.browseCategories')}
            />
          )}
        </Container>
      </div>
    </>
  )
}
