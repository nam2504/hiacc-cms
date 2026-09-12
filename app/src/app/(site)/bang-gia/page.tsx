import type { Metadata } from 'next'
import { Container } from '@/components/ui/Container'
import { EmptyState } from '@/components/news/EmptyState'
import { PageHero } from '@/components/news/PageHero'
import { createTranslator } from '@/lib/i18n'
import { localizedHref } from '@/lib/nav'
import { DEFAULT_LOCALE } from '@/lib/locales'
import { getRequestLocale } from '@/lib/requestLocale'
import { localeAlternates, localePath, ogImages, ogLocale } from '@/lib/seo'
import { getPayloadClient, getSettings, siteDisplayName } from '@/lib/site'
import { getServiceTree } from '@/lib/serviceTree'
import type { PricingPlan } from '@/payload-types'
import styles from './page.module.css'

/**
 * /bang-gia — khách feedback 12/09: cần nơi tự set nội dung trong admin.
 *
 * Đọc `pricing-plans` (collection mới, mỗi gói gắn với một nhóm dịch vụ cấp
 * cao nhất) rồi nhóm theo `serviceGroup`. Nhóm dịch vụ nào chưa có gói giá thì
 * không dựng bảng rỗng. Toàn trang chưa có gói nào (khách chưa nhập liệu) thì
 * vẫn giữ `EmptyState` như bản giữ chỗ cũ, không hiện trang trắng.
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

/** `serviceGroup` là quan hệ tới `service-nodes` — depth 0 chỉ trả id, cần depth 1 lấy tên nhóm. */
async function getPlans(locale: string): Promise<PricingPlan[]> {
  try {
    const payload = await getPayloadClient()
    const res = await payload.find({
      collection: 'pricing-plans',
      limit: 200,
      depth: 1,
      sort: 'order',
      locale: locale as Parameters<typeof payload.find>[0]['locale'],
    })
    return res.docs as PricingPlan[]
  } catch (error) {
    console.error('[pricing-plans] không đọc được bảng giá:', error)
    return []
  }
}

export default async function PricingPage() {
  const locale = await getRequestLocale()
  const t = createTranslator(locale)
  const [plans, tree] = await Promise.all([getPlans(locale), getServiceTree(locale)])

  const groups = tree
    .map((node) => ({
      id: node.id,
      title: node.title,
      plans: plans.filter((plan) => {
        const groupId =
          plan.serviceGroup && typeof plan.serviceGroup === 'object'
            ? plan.serviceGroup.id
            : plan.serviceGroup
        return String(groupId) === String(node.id)
      }),
    }))
    .filter((group) => group.plans.length > 0)

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
          groups.map((group) => (
            <section className={styles.group} key={group.id}>
              <h2 className={styles.groupTitle}>{group.title}</h2>
              <div className={styles.grid}>
                {group.plans.map((plan) => (
                  <article
                    className={`${styles.card} ${plan.featured ? styles.cardFeatured : ''}`}
                    key={plan.id}
                  >
                    <h3 className={styles.cardName}>{plan.name}</h3>
                    <p className={styles.cardPrice}>{plan.price}</p>
                    {plan.summary && <p className={styles.cardSummary}>{plan.summary}</p>}
                    {plan.features && plan.features.length > 0 && (
                      <ul className={styles.cardFeatures}>
                        {plan.features.map((feature, index) => (
                          <li key={feature.id ?? index}>{feature.text}</li>
                        ))}
                      </ul>
                    )}
                  </article>
                ))}
              </div>
            </section>
          ))
        )}
      </Container>
    </>
  )
}
