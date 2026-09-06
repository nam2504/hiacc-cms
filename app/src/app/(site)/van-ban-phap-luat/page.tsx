import type { Metadata } from 'next'
import { Container } from '@/components/ui/Container'
import { LEGAL_GROUPS } from '@/collections/LegalDocuments'
import { brandName } from '@/config/tenant'
import { ogImages } from '@/lib/seo'
import { getPayloadClient, getSettings } from '@/lib/site'
import type { LegalDocument } from '@/payload-types'
import styles from './page.module.css'

/**
 * /van-ban-phap-luat — thư viện văn bản, thiết kế khách 06/09.
 *
 * Tabs 7 nhóm dựng bằng LINK + `#anchor` chứ không phải JavaScript: mỗi nhóm là
 * một mục có thể chia sẻ được, và trang vẫn dùng được khi JS chưa tải xong.
 *
 * ⚠️ Cột cuối chỉ có "Xem nguồn" trỏ ra trang của cơ quan ban hành. KHÔNG có nút
 * tải file — yêu cầu rõ của khách, xem chú thích trong collection.
 */
export const dynamic = 'force-dynamic'

const TITLE = 'Hệ thống văn bản pháp luật'
const SUBTITLE =
  'Luật, nghị định và thông tư liên quan đến kế toán, thuế, bảo hiểm xã hội, lao động, đăng ký kinh doanh, đầu tư và thương mại.'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()
  const images = ogImages(settings?.logo)

  return {
    title: TITLE,
    description: SUBTITLE,
    alternates: { canonical: '/van-ban-phap-luat' },
    openGraph: {
      type: 'website',
      url: '/van-ban-phap-luat',
      siteName: brandName(settings?.siteName),
      locale: 'vi_VN',
      title: TITLE,
      description: SUBTITLE,
      images,
    },
  }
}

async function getDocuments(): Promise<LegalDocument[]> {
  try {
    const payload = await getPayloadClient()
    const res = await payload.find({
      collection: 'legal-documents',
      limit: 500,
      depth: 0,
      sort: 'order',
    })
    return res.docs as LegalDocument[]
  } catch (error) {
    console.error('[legal-documents] không đọc được danh mục văn bản:', error)
    return []
  }
}

export default async function LegalDocumentsPage() {
  const [docs, settings] = await Promise.all([getDocuments(), getSettings()])
  const siteName = brandName(settings?.siteName)

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
          <p className={styles.kicker}>Thư viện</p>
          <h1 className={styles.title}>{TITLE}</h1>
          <p className={styles.subtitle}>{SUBTITLE}</p>
        </Container>
      </section>

      <Container>
        {groupsWithItems.length === 0 ? (
          <p className={styles.empty}>Danh mục văn bản đang được cập nhật.</p>
        ) : (
          <>
            <nav className={styles.tabs} aria-label="Nhóm văn bản">
              {groupsWithItems.map((group) => (
                <a key={group.value} className={styles.tab} href={`#${group.value}`}>
                  {group.label}
                </a>
              ))}
            </nav>

            {groupsWithItems.map((group) => (
              <section className={styles.group} key={group.value} id={group.value}>
                <h2 className={styles.groupTitle}>{group.label}</h2>
                <p className={styles.groupCount}>{group.items.length} văn bản trong nhóm này.</p>

                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th scope="col">Số hiệu</th>
                        <th scope="col">Tên văn bản</th>
                        <th scope="col">Cơ quan ban hành</th>
                        <th scope="col">Hiệu lực</th>
                        <th scope="col">Liên kết</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.items.map((doc) => (
                        <tr key={doc.id}>
                          <td className={styles.code}>{doc.code}</td>
                          <td className={styles.name}>{doc.title}</td>
                          <td>{doc.issuer}</td>
                          <td>{doc.effectiveYear}</td>
                          <td>
                            {doc.sourceUrl ? (
                              <a
                                className={styles.source}
                                href={doc.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Xem nguồn →
                              </a>
                            ) : (
                              <span className={styles.noSource}>Đang cập nhật</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}

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
