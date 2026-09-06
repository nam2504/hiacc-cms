import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ServiceBody } from '@/components/services/ServiceBody'
import { ServiceSidebar } from '@/components/services/ServiceSidebar'
import { JsonLd, breadcrumbJsonLd } from '@/components/seo/JsonLd'
import { Container } from '@/components/ui/Container'
import { brandName } from '@/config/tenant'
import { createTranslator } from '@/lib/i18n'
import { ogImages } from '@/lib/seo'
import { findByPath, getServiceTree, type TreeNode } from '@/lib/serviceTree'
import type { LocaleCode } from '@/lib/locales'
import { getSettings, mediaUrl, toPayloadLocale } from '@/lib/site'
import { getPayloadClient } from '@/lib/site'
import type { ServiceNode } from '@/payload-types'
import styles from './page.module.css'
import { getRequestLocale } from '@/lib/requestLocale'

/**
 * Route bắt mọi đường dẫn còn lại — dùng cho CÂY dịch vụ.
 *
 * Vì sao catch-all thay vì 5 route cố định: cây nằm trong DB, khách tự thêm nhóm
 * và hạng mục trong /admin, và site thứ hai (HiTax) có cây khác hẳn. Route cố
 * định thì mỗi lần khách thêm nhóm lại phải sửa code (WS-6 T-hitax).
 *
 * Các route khai tường minh (/tin-tuc, /lien-he, /gioi-thieu, /chuyen-muc,
 * /cong-cu/...) được Next ưu tiên khớp trước, nên catch-all không nuốt chúng.
 *
 * Route này THAY LUÔN vai trò của `[...notFound]` cũ (đã xoá — Next không cho
 * hai catch-all khác tên ở cùng một cấp): đường dẫn không khớp cây vẫn rơi vào
 * `notFound()`, tức vào not-found.tsx của (site) nên CÓ Header/Footer, và vẫn
 * trả đúng HTTP 404 chứ không phải 200 (AUDIT §5.1).
 *
 * `force-dynamic` giữ đúng lý do đã ghi ở các trang khác: build-time DB rỗng,
 * nướng tĩnh sẽ ship ra trang trắng trả 200.
 */
export const dynamic = 'force-dynamic'

type Params = { slug: string[] }

/** Đọc phần nội dung đầy đủ của node — cây chỉ giữ phần nhẹ để dựng menu. */
async function getNodeDetail(id: string, locale: LocaleCode): Promise<ServiceNode | null> {
  try {
    const payload = await getPayloadClient()
    return (await payload.findByID({
      collection: 'service-nodes',
      id,
      depth: 1,
      locale: toPayloadLocale(locale),
    })) as ServiceNode
  } catch (error) {
    console.error('[service-node] không đọc được chi tiết mục:', id, error)
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const locale = await getRequestLocale()
  const { slug } = await params
  const tree = await getServiceTree(locale)
  const match = findByPath(tree, slug)
  if (!match) return {}

  const [detail, settings] = await Promise.all([getNodeDetail(match.node.id, locale), getSettings(locale)])
  const title = detail?.seo?.title || match.node.title
  const description = detail?.seo?.description || match.node.summary || undefined
  const images = ogImages(detail?.seo?.image, settings?.logo)

  return {
    title,
    description,
    alternates: { canonical: match.node.path },
    openGraph: {
      type: 'website',
      url: match.node.path,
      siteName: brandName(settings?.siteName),
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

export default async function ServiceNodePage({ params }: { params: Promise<Params> }) {
  const locale = await getRequestLocale()
  const { slug } = await params
  const tree = await getServiceTree(locale)
  const match = findByPath(tree, slug)
  // Đường dẫn không có trong cây → 404 THẬT. Không render khung rỗng trả 200:
  // trang 200 mà trống là thứ Google index rồi mới phát hiện là rác.
  if (!match) notFound()

  const { node, trail, root } = match
  const tr = createTranslator(locale)
  const detail = await getNodeDetail(node.id, locale)

  /**
   * Node có con (một NHÓM) thì hiện hạng mục đầu tiên ngay trong trang nhóm —
   * đúng prototype: vào /ke-toan là đã đọc được "Kế toán trọn gói", không phải
   * bấm thêm một lần nữa mới có nội dung.
   */
  const isGroup = node.children.length > 0
  const shown = isGroup ? node.children[0] : node
  const shownDetail = isGroup ? await getNodeDetail(shown.id, locale) : detail

  // Danh sách cho sidebar: các anh em cùng nhóm (hoặc con của chính nó nếu là nhóm).
  const siblings = isGroup ? node.children : findSiblings(tree, trail)
  const heroStats = detail?.heroStats ?? []
  const heroImage = mediaUrl(detail?.image)
  const related = tree.filter((item) => item.id !== root.id)

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: tr('seo.breadcrumb.home'), path: '/' },
          ...trail.map((item) => ({ name: item.title, path: item.path })),
        ])}
      />

      <section className={styles.hero}>
        <Container>
          <nav className={styles.crumbs} aria-label="Breadcrumb">
            <ol>
              <li>
                <Link href="/">{tr('seo.breadcrumb.home')}</Link>
              </li>
              {trail.map((item, index) => (
                <li key={item.id}>
                  {index === trail.length - 1 ? (
                    <span aria-current="page">{item.title}</span>
                  ) : (
                    <Link href={item.path}>{item.title}</Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          <div className={heroImage ? styles.heroSplit : styles.heroPlain}>
            <div className={styles.heroCopy}>
              <h1 className={styles.title}>{node.title}</h1>
              {node.summary ? <p className={styles.summary}>{node.summary}</p> : null}

              {heroStats.length > 0 ? (
                <dl className={styles.stats}>
                  {heroStats.map((stat, index) => (
                    <div className={styles.stat} key={stat.id ?? index}>
                      <dt className={styles.statValue}>{stat.value}</dt>
                      <dd className={styles.statLabel}>{stat.label}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>

            {heroImage ? (
              // eslint-disable-next-line @next/next/no-img-element -- ảnh nền hero,
              // kích thước do CSS quyết định; next/image ở đây không thêm giá trị.
              <img className={styles.heroImage} src={heroImage} alt="" aria-hidden="true" />
            ) : null}
          </div>
        </Container>
      </section>

      <Container>
        <div className={styles.layout}>
          {siblings.length > 0 ? (
            <ServiceSidebar
              items={siblings}
              activePath={isGroup ? shown.path : node.path}
              title={isGroup ? node.title : root.title}
            />
          ) : null}

          <div className={styles.content}>
            <h2 className={styles.contentTitle}>{shown.title}</h2>
            {shown.summary ? <p className={styles.contentLead}>{shown.summary}</p> : null}

            <ServiceBody body={shownDetail?.body} />

            <div className={styles.actions}>
              <Link className={styles.actionPrimary} href="/lien-he">
                {tr('service.requestQuote')}
              </Link>
              {isGroup ? (
                <Link className={styles.actionGhost} href={shown.path}>
                  {tr('service.viewOwnPage')}
                </Link>
              ) : null}
            </div>

            {related.length > 0 ? (
              <section className={styles.related}>
                <h2 className={styles.relatedTitle}>{tr('service.related')}</h2>
                <ul className={styles.relatedGrid}>
                  {related.map((item) => (
                    <li key={item.id}>
                      <Link className={styles.relatedCard} href={item.path}>
                        <span className={styles.relatedKicker}>{tr('nav.serviceGroup')}</span>
                        <span className={styles.relatedName}>{item.title}</span>
                        {item.summary ? (
                          <span className={styles.relatedSummary}>{item.summary}</span>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        </div>
      </Container>
    </>
  )
}

/** Các mục cùng cấp với node đang xem (để sidebar hiện đủ hạng mục của nhóm). */
function findSiblings(tree: TreeNode[], trail: TreeNode[]): TreeNode[] {
  if (trail.length <= 1) return []
  const parent = trail[trail.length - 2]
  return parent.children
}
