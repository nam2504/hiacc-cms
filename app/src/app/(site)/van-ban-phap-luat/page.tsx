import type { Metadata } from 'next'
import { Container } from '@/components/ui/Container'
import { LEGAL_GROUPS } from '@/collections/LegalDocuments'
import { localeAlternates, localePath, ogImages, ogLocale } from '@/lib/seo'
import { getPayloadClient, getSettings, siteDisplayName } from '@/lib/site'
import type { LegalDocument } from '@/payload-types'
import { logger } from '@/lib/observability/logger'
import styles from './page.module.css'
import { getRequestLocale } from '@/lib/requestLocale'
import { createTranslator } from '@/lib/i18n'
import { LegalDocTabs } from './LegalDocTabs'

/**
 * /van-ban-phap-luat — thư viện văn bản, thiết kế khách 06/09.
 *
 * Tabs 7 nhóm là tab THẬT (state, client component `LegalDocTabs`) — khách
 * feedback 12/09: bản trước dùng LINK + `#anchor` xếp dọc cả 7 bảng trên DOM
 * và cuộn tới, không phải tab thật.
 *
 * ⚠️ Cột cuối chỉ có "Xem nguồn" trỏ ra trang của cơ quan ban hành. KHÔNG có nút
 * tải file — yêu cầu rõ của khách, xem chú thích trong collection.
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

/*
 * Tiêu đề trang lấy từ i18n, KHÔNG hằng số module (09/09).
 *
 * Bản trước để `const TITLE = 'Hệ thống văn bản pháp luật'` ở tầng module: chuỗi
 * cố định một ngôn ngữ, nên /en/van-ban-phap-luat hiện tiêu đề tiếng Việt cả ở
 * thẻ <title>, og:title lẫn <h1>. Dịch phải diễn ra TRONG hàm, nơi có locale.
 */

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  const t = createTranslator(locale)
  const settings = await getSettings(locale)
  const images = ogImages(settings?.logo)
  const title = t('legalDocs.title')
  const subtitle = t('legalDocs.subtitle')

  return {
    title,
    description: subtitle,
    alternates: localeAlternates('/van-ban-phap-luat', locale),
    openGraph: {
      type: 'website',
      // Theo ngôn ngữ, cùng lý do với canonical ở `alternates` ngay trên.
      url: localePath('/van-ban-phap-luat', locale),
      siteName: siteDisplayName(settings, locale),
      locale: ogLocale(locale),
      title,
      description: subtitle,
      images,
    },
  }
}

/**
 * `title` và `issuer` là field localized, nên phải nói rõ đang đọc ngôn ngữ nào.
 * Không truyền thì Payload trả bản mặc định và trang tiếng Anh hiện tên văn bản
 * bằng tiếng Việt. Chỗ nào chưa dịch vẫn rơi về tiếng Việt nhờ `fallback: true`.
 */
async function getDocuments(locale: string): Promise<LegalDocument[]> {
  try {
    const payload = await getPayloadClient()
    const res = await payload.find({
      collection: 'legal-documents',
      limit: 500,
      depth: 0,
      sort: 'order',
      locale: locale as Parameters<typeof payload.find>[0]['locale'],
    })
    return res.docs as LegalDocument[]
  } catch (error) {
    logger.error('[legal-documents] không đọc được danh mục văn bản:', error)
    return []
  }
}

export default async function LegalDocumentsPage() {
  const locale = await getRequestLocale()
  const t = createTranslator(locale)
  const [docs, settings] = await Promise.all([getDocuments(locale), getSettings(locale)])
  const siteName = siteDisplayName(settings, locale)

  const byGroup = LEGAL_GROUPS.map((group) => ({
    ...group,
    items: docs.filter((doc) => doc.group === group.value),
  }))
  // Nhóm chưa có văn bản nào thì không dựng tab rỗng cho người đọc bấm vào.
  const groupsWithItems = byGroup.filter((group) => group.items.length > 0)

  return (
    <>
      <section className={styles.hero}>
        <Container>
          <p className={styles.kicker}>{t('legalDocs.kicker')}</p>
          <h1 className={styles.title}>{t('legalDocs.title')}</h1>
          <p className={styles.subtitle}>{t('legalDocs.subtitle')}</p>
        </Container>
      </section>

      <Container>
        {groupsWithItems.length === 0 ? (
          <p className={styles.empty}>Danh mục văn bản đang được cập nhật.</p>
        ) : (
          <>
            <LegalDocTabs groups={groupsWithItems} />

            <p className={styles.note}>
              Danh mục dẫn tới văn bản trên trang của cơ quan ban hành. {siteName} không
              đăng lại file văn bản để tránh sai lệch khi bản gốc được sửa đổi.
            </p>
          </>
        )}
      </Container>
    </>
  )
}
