import type { Metadata } from 'next'
import { cache } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ServiceBody } from '@/components/services/ServiceBody'
import { ServiceSidebar } from '@/components/services/ServiceSidebar'
import { QuickQuoteCard } from '@/components/services/QuickQuoteCard'
import { JsonLd, breadcrumbJsonLd } from '@/components/seo/JsonLd'
import { Container } from '@/components/ui/Container'
import { brandName } from '@/config/tenant'
import { createTranslator } from '@/lib/i18n'
import { localeAlternates, localePath, ogImages, ogLocale } from '@/lib/seo'
import { localizedHref } from '@/lib/nav'
import { findByPath, getServiceTree, type TreeNode } from '@/lib/serviceTree'
import { DEFAULT_LOCALE, type LocaleCode } from '@/lib/locales'
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

type Params = { slug: string[] }

/**
 * Đọc phần nội dung đầy đủ của node — cây chỉ giữ phần nhẹ để dựng menu.
 *
 * `cache()`: generateMetadata và chính page đều gọi cho cùng một node, và trang
 * NHÓM còn gọi thêm cho hạng mục hiển thị. Không dedupe thì mỗi lượt tải là
 * 3–4 lượt findByID.
 */
const getNodeDetail = cache(async (id: string, locale: LocaleCode): Promise<ServiceNode | null> => {
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
})

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
    alternates: localeAlternates(match.node.path, locale),
    openGraph: {
      type: 'website',
      // Theo ngôn ngữ, cùng lý do với canonical ở `alternates` ngay trên.
      url: localePath(match.node.path, locale),
      siteName: brandName(settings?.siteName),
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
  // Breadcrumb, nút CTA và thẻ dịch vụ liên quan phải giữ ngôn ngữ đang xem —
  // `path` trong cây không có tiền tố ngôn ngữ.
  const href = (path: string) => localizedHref(path, locale, DEFAULT_LOCALE)
  const detail = await getNodeDetail(node.id, locale)
  // Hotline cho hộp "Cần báo phí nhanh?" ở sidebar — lấy từ Settings, không hardcode.
  const settings = await getSettings(locale)

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
  // Trang NHÓM giữ dải số của nhóm; trang HẠNG MỤC suy 4 ô theo Figma.
  const heroStats = isGroup ? (detail?.heroStats ?? []) : leafStats(detail, tr)
  const heroImage = mediaUrl(detail?.image)
  const related = tree.filter((item) => item.id !== root.id)

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(
          [
            { name: tr('seo.breadcrumb.home'), path: '/' },
            ...trail.map((item) => ({ name: item.title, path: item.path })),
          ],
          locale,
        )}
      />

      <section className={styles.hero}>
        <Container>
          <nav className={styles.crumbs} aria-label="Breadcrumb">
            <ol>
              <li>
                <Link href={href('/')}>{tr('seo.breadcrumb.home')}</Link>
              </li>
              {trail.map((item, index) => (
                <li key={item.id}>
                  {index === trail.length - 1 ? (
                    <span aria-current="page">{item.title}</span>
                  ) : (
                    <Link href={href(item.path)}>{item.title}</Link>
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
            <div className={styles.sidebarCol}>
              <ServiceSidebar
                items={siblings}
                activePath={isGroup ? shown.path : node.path}
                title={isGroup ? node.title : root.title}
              />
              <QuickQuoteCard settings={settings} />
            </div>
          ) : null}

          <div className={styles.content}>
            <h2 className={styles.contentTitle}>{shown.title}</h2>
            {shown.summary ? <p className={styles.contentLead}>{shown.summary}</p> : null}

            <ServiceBody body={shownDetail?.body} />

            <div className={styles.actions}>
              <Link className={styles.actionPrimary} href={href('/lien-he')}>
                {tr('service.requestQuote')}
              </Link>
              {isGroup ? (
                <Link className={styles.actionGhost} href={href(shown.path)}>
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
                      <Link className={styles.relatedCard} href={href(item.path)}>
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

/**
 * Dải số liệu cho trang HẠNG MỤC (trang lá) — 4 ô theo Figma:
 * THỜI GIAN · PHÍ DỊCH VỤ TỪ · SỐ PHẦN NỘI DUNG · CẬP NHẬT.
 *
 * Vì sao tự suy thay vì bắt khách gõ tay vào `heroStats`: 3/4 ô đã nằm sẵn
 * trong dữ liệu (bảng giá, số khối nội dung, ngày sửa gần nhất). Bắt nhập tay
 * nghĩa là mỗi lần khách sửa bảng giá lại phải nhớ sửa ô "phí từ" — chắc chắn
 * sẽ lệch. Ô THỜI GIAN không suy được nên vẫn đọc từ `heroStats` nếu khách nhập.
 *
 * `heroStats` khách tự nhập LUÔN được ưu tiên: đây chỉ là giá trị mặc định.
 */
function leafStats(
  detail: ServiceNode | null,
  tr: ReturnType<typeof createTranslator>,
): { value: string; label: string; id?: string | null }[] {
  if (!detail) return []
  const custom = detail.heroStats ?? []
  const byLabel = new Map(custom.map((s) => [s.label, s.value]))

  const body = detail.body ?? []
  const pricing = body.find((b) => b.blockType === 'pricingTable')
  // Phí thấp nhất trong bảng giá. `fee` là chữ ("từ 3.000.000 / tháng") nên bóc
  // cụm số đầu tiên ra để so sánh; ô nào không có số ("liên hệ") thì bỏ qua.
  let cheapest: { text: string; num: number } | null = null
  if (pricing && 'rows' in pricing) {
    for (const row of pricing.rows ?? []) {
      const raw = row.fee ?? ''
      const m = raw.match(/[\d][\d.,]*/)
      if (!m) continue
      const num = Number(m[0].replace(/[.,]/g, ''))
      if (!Number.isFinite(num)) continue
      if (!cheapest || num < cheapest.num) cheapest = { text: m[0], num }
    }
  }

  const updated = detail.updatedAt ? new Date(detail.updatedAt) : null
  const stats: { value: string; label: string; id?: string | null }[] = []
  const push = (label: string, fallback: string | null) => {
    const value = byLabel.get(label) ?? fallback
    if (value) stats.push({ value, label })
  }

  push(tr('service.stat.duration'), null)
  push(tr('service.stat.feeFrom'), cheapest?.text ?? null)
  push(tr('service.stat.sections'), body.length > 0 ? String(body.length) : null)
  push(
    tr('service.stat.updated'),
    updated
      ? `${String(updated.getMonth() + 1).padStart(2, '0')} / ${updated.getFullYear()}`
      : null,
  )
  return stats
}

/** Các mục cùng cấp với node đang xem (để sidebar hiện đủ hạng mục của nhóm). */
function findSiblings(tree: TreeNode[], trail: TreeNode[]): TreeNode[] {
  if (trail.length <= 1) return []
  const parent = trail[trail.length - 2]
  return parent.children
}
