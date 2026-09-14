import type { Metadata } from 'next'
import { Container } from '@/components/ui/Container'
import { EmptyState } from '@/components/news/EmptyState'
import { PageHero } from '@/components/news/PageHero'
import { createTranslator } from '@/lib/i18n'
import { localizedHref } from '@/lib/nav'
import { DEFAULT_LOCALE } from '@/lib/locales'
import { getRequestLocale } from '@/lib/requestLocale'
import { localeAlternates, localePath, ogImages, ogLocale } from '@/lib/seo'
import { getSettings, siteDisplayName } from '@/lib/site'
import { getServiceTree, getPricingRowsByNodeId, type TreeNode, type PricingRow } from '@/lib/serviceTree'
import styles from './page.module.css'

/**
 * /bang-gia — nguồn giá DUY NHẤT là collection `pricing-plans` (đổi 14/09,
 * đảo lại hướng 13/09 từng đọc từ `service-nodes.body` block `pricingTable`
 * — khối đó giờ chỉ còn là placeholder vị trí, xem `collections/blocks.ts`).
 * Gộp mọi dòng giá của mọi hạng mục con vào một bảng theo NHÓM GỐC (đúng bố
 * cục figma khách duyệt — "01 Kế toán" là một bảng duy nhất).
 *
 * Đọc Settings nên phải dynamic; xem chú thích cùng loại ở /chuyen-muc.
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
  const settings = await getSettings(locale)
  const title = t('nav.pricing')
  const description = t('pricing.pending.body')

  return {
    title,
    description,
    alternates: localeAlternates('/bang-gia', locale),
    openGraph: {
      type: 'website',
      // Theo ngôn ngữ, cùng lý do với canonical ở `alternates` ngay trên.
      url: localePath('/bang-gia', locale),
      siteName: siteDisplayName(settings, locale),
      locale: ogLocale(locale),
      title,
      description,
      images: ogImages(settings?.logo),
    },
  }
}

export default async function PricingPage() {
  const locale = await getRequestLocale()
  const t = createTranslator(locale)
  const [rowsByNode, tree] = await Promise.all([getPricingRowsByNodeId(locale), getServiceTree(locale)])

  /** Gộp bảng giá của node và toàn bộ hậu duệ vào nhóm gốc — khớp figma (1 bảng/nhóm). */
  const collectRows = (node: TreeNode): PricingRow[] => [
    ...(rowsByNode.get(node.id) ?? []),
    ...node.children.flatMap(collectRows),
  ]

  const groups = tree
    .map((root) => ({ id: root.id, title: root.title, rows: collectRows(root) }))
    .filter((group) => group.rows.length > 0)

  return (
    <>
      <PageHero
        title={t('nav.pricing')}
        crumbs={[{ label: t('seo.breadcrumb.home'), href: localizedHref('/', locale, DEFAULT_LOCALE) }]}
      />
      <Container>
        {groups.length === 0 ? (
          <EmptyState
            title={t('pricing.pending.title')}
            body={t('pricing.pending.body')}
            actionHref={localizedHref('/lien-he', locale, DEFAULT_LOCALE)}
            actionLabel={t('nav.contact')}
          />
        ) : (
          groups.map((group, groupIndex) => (
            <section className={styles.group} key={group.id}>
              <h2 className={styles.groupTitle}>
                <span className={styles.groupIndex}>{String(groupIndex + 1).padStart(2, '0')}</span>
                {group.title}
              </h2>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>{t('pricing.table.item')}</th>
                      <th>{t('pricing.table.scope')}</th>
                      <th>{t('pricing.table.price')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.rows.map((row) => (
                      <tr key={row.id}>
                        <td>{row.item}</td>
                        <td>{row.scope}</td>
                        <td className={styles.price}>{row.fee}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))
        )}
      </Container>
    </>
  )
}
