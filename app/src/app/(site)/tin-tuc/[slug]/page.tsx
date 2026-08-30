import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageHero } from '@/components/news/PageHero'
import { PostArticle } from '@/components/news/PostArticle'
import { seoMetadata } from '@/components/news/params'
import { JsonLd, articleJsonLd, breadcrumbJsonLd } from '@/components/seo/JsonLd'
import { t } from '@/lib/i18n'
import { absoluteMediaUrl, absoluteUrl, ogImages } from '@/lib/seo'
import { getPostBySlug, getSettings } from '@/lib/site'
import type { Category } from '@/payload-types'

type Params = Promise<{ slug: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const [post, settings] = await Promise.all([getPostBySlug(slug), getSettings()])
  if (!post) return { title: t('error.notFound.title') }

  const base = seoMetadata(post.seo, post.title, post.excerpt)
  const path = `/tin-tuc/${post.slug}`
  // Ảnh OG riêng của bài → ảnh bìa → logo site. Không có cái nào thì bỏ hẳn field.
  const images = ogImages(post.seo?.image, post.cover, settings?.logo)

  return {
    ...base,
    alternates: { canonical: path },
    openGraph: {
      type: 'article',
      url: path,
      siteName: settings?.siteName || t('seo.siteName'),
      locale: 'vi_VN',
      title: base.title as string,
      description: base.description ?? undefined,
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt,
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
 * /tin-tuc/<slug> — chi tiết bài viết.
 * getPostBySlug() trả null khi không có bài HOẶC khi DB lỗi; cả hai đều ra 404,
 * chấp nhận được vì thà 404 còn hơn lộ trang trắng có mã 200 cho Google.
 */
export default async function PostDetailPage({ params }: { params: Params }) {
  const { slug } = await params
  const [post, settings] = await Promise.all([getPostBySlug(slug), getSettings()])
  if (!post) notFound()

  const category = typeof post.category === 'object' ? (post.category as Category) : null

  // Bài viết chưa có field tác giả trong schema → đứng tên site (contract §5).
  const authorName = settings?.siteName || t('seo.siteName')
  const jsonLd = [
    articleJsonLd({
      headline: post.title,
      url: absoluteUrl(`/tin-tuc/${post.slug}`),
      description: post.seo?.description || post.excerpt,
      imageUrl: absoluteMediaUrl(post.seo?.image) ?? absoluteMediaUrl(post.cover),
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      authorName,
    }),
    breadcrumbJsonLd([
      { name: t('seo.breadcrumb.home'), path: '/' },
      { name: t('news.list.title'), path: '/tin-tuc' },
      ...(category ? [{ name: category.name, path: `/chuyen-muc/${category.slug}` }] : []),
      { name: post.title, path: `/tin-tuc/${post.slug}` },
    ]),
  ]

  return (
    <>
      <JsonLd data={jsonLd} />
      {/* Không truyền title: <h1> của trang này nằm trong <PostArticle> */}
      <PageHero
        crumbs={[
          { label: t('news.list.title'), href: '/tin-tuc' },
          ...(category ? [{ label: category.name, href: `/chuyen-muc/${category.slug}` }] : []),
          { label: post.title },
        ]}
      />
      <PostArticle post={post} />
    </>
  )
}
