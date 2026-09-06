import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import type { TreeNode } from '@/lib/serviceTree'
import type { Setting } from '@/payload-types'
import styles from './ServiceGroups.module.css'

/**
 * "Lĩnh vực hoạt động" — 5 thẻ nhóm dịch vụ, mỗi thẻ có ảnh, icon, mô tả và
 * danh sách hạng mục bên trong (thiết kế `Trang chủ.png`, khối 6).
 *
 * Dữ liệu lấy từ CÂY trong DB, nên khách thêm nhóm trong /admin là trang chủ
 * hiện thêm thẻ — không phải sửa code. Nhóm chưa có hạng mục con vẫn hiện thẻ,
 * chỉ không có danh sách.
 */
export function ServiceGroups({
  tree,
  settings,
  images = {},
}: {
  tree: TreeNode[]
  settings: Setting | null
  /** URL ảnh theo id node — cây chỉ giữ phần nhẹ nên ảnh truyền riêng. */
  images?: Record<string, string>
}) {
  if (tree.length === 0) return null

  const title = settings?.home?.servicesTitle || 'Lĩnh vực hoạt động'
  const subtitle =
    settings?.home?.servicesSubtitle ||
    'Từ kế toán trọn gói tới giấy phép hoạt động — chọn đúng phần doanh nghiệp bạn cần.'

  return (
    <section className={styles.section}>
      <Container>
        <div className={styles.head}>
          <h2 className={styles.title}>{title}</h2>
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        </div>

        <ul className={styles.grid}>
          {tree.map((group) => (
            <li key={group.id} className={styles.item}>
              <article className={styles.card}>
                {images[group.id] ? (
                  <Image
                    className={styles.image}
                    src={images[group.id]}
                    alt=""
                    width={480}
                    height={320}
                    // Khung cố định qua width/height + CSS aspect-ratio để ảnh tải
                    // xong không đẩy nội dung nhảy xuống (CLS = 0, chuẩn V4).
                    sizes="(min-width: 900px) 30vw, 100vw"
                  />
                ) : null}

                <div className={styles.body}>
                  <p className={styles.cardIcon} aria-hidden="true">
                    <Icon name={group.icon ?? 'folder'} />
                  </p>
                  <h3 className={styles.cardTitle}>{group.title}</h3>
                  {group.summary ? <p className={styles.cardSummary}>{group.summary}</p> : null}

                  {group.children.length > 0 ? (
                    <ul className={styles.items}>
                      {group.children.map((child) => (
                        <li key={child.id}>
                          <Link className={styles.itemLink} href={child.path}>
                            {child.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  <Link className={styles.more} href={group.path}>
                    Xem chi tiết →
                  </Link>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
