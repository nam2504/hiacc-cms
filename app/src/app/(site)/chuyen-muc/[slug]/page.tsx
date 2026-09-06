import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Container } from '@/components/ui/Container'
import { EmptyState } from '@/components/news/EmptyState'
import { PageHero } from '@/components/news/PageHero'
import { Pagination } from '@/components/news/Pagination'
import { PostGrid } from '@/components/news/PostGrid'
import { readPage, seoMetadata, type SearchParams } from '@/components/news/params'
import { JsonLd, breadcrumbJsonLd } from '@/components/seo/JsonLd'
import { t } from '@/lib/i18n'
import { ogImages } from '@/lib/seo'
import { getCategoryBySlug, getPosts, getSettings } from '@/lib/site'
import styles from './page.module.css'
import { getRequestLocale } from '@/lib/requestLocale'

const PER_PAGE = 9

type Params = Promise<{ slug: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const locale = await getRequestLocale()
  const { slug } = await params
  const [category, settings] = await Promise.all([getCategoryBySlug(slug), getSettings(locale)])
  if (!category) return { title: t('error.notFound.title') }

  const base = seoMetadata(category.seo, category.name, category.description)
  const path = `/chuyen-muc/${category.slug}`
  const images = ogImages(category.seo?.image, settings?.logo)

  return {
    ...base,
    // Canonical trỏ trang 1: `?page=` là biến thể phân trang, không phải URL riêng.
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      url: path,
      siteName: settings?.siteName || t('seo.siteName'),
      locale: 'vi_VN',
      title: base.title as string,
      description: base.description ?? undefined,
      images,
    },
    twitter: {
      card: images.length > 0 ? 'summary_large_image' : 'summary',
      title: base.title as string,
      description: base.description ?? undefined,
      images,
    },
  }
}

/**
 * /chuyen-muc/<slug> — bài viết thuộc một chuyên mục, phân trang như /tin-tuc.
 *
 * 9/12 chuyên mục seed hiện chưa có bài nào, nên nhánh rỗng là đường đi THƯỜNG
 * GẶP: vẫn phải trả 200 kèm trạng thái rỗng, chỉ 404 khi chuyên mục không tồn tại.
 */
export default async function CategoryDetailPage({
  params,
  searchParams,
}: {
  params: Params
  searchParams: SearchParams
}) {
  const locale = await getRequestLocale()
  const [{ slug }, query] = await Promise.all([params, searchParams])
  const category = await getCategoryBySlug(slug, locale)
  if (!category) notFound()

  const page = readPage(query.page)
  const { docs, totalPages } = await getPosts({ categorySlug: slug, page, limit: PER_PAGE , locale })

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: t('seo.breadcrumb.home'), path: '/' },
          { name: t('news.categories.title'), path: '/chuyen-muc' },
          { name: category.name, path: `/chuyen-muc/${category.slug}` },
        ])}
      />
      <PageHero
        title={category.name}
        description={category.description}
        crumbs={[
          { label: t('news.categories.title'), href: '/chuyen-muc' },
          { label: category.name },
        ]}
      />

      <div className={styles.body}>
        <Container>
          {docs.length > 0 ? (
            <>
              <PostGrid posts={docs} />
              <Pagination
                basePath={`/chuyen-muc/${category.slug}`}
                page={page}
                totalPages={totalPages}
              />
            </>
          ) : (
            <EmptyState
              title={t('news.category.empty.title')}
              body={t('news.category.empty.body')}
              actionHref="/tin-tuc"
              actionLabel={t('news.category.empty.allPosts')}
            />
          )}
        </Container>
      </div>
    </>
  )
}
