import { Container } from '@/components/ui/Container'
import type { TreeNode } from '@/lib/serviceTree'
import type { Setting } from '@/payload-types'
import { Logo } from './Logo'
import { MegaMenu, type StaticNavItem } from './MegaMenu'
import { TopBar } from './TopBar'
import styles from './Header.module.css'

/**
 * Đầu trang: TopBar (liên hệ + link phụ) + logo + menu. Dính trên cùng khi cuộn.
 *
 * Cây dịch vụ đọc từ DB ở layout rồi truyền xuống — menu là 5 nhóm dịch vụ, khách
 * thêm nhóm trong /admin là menu đổi theo. Server component; chỉ MegaMenu là
 * client vì cần state đóng/mở.
 */

/** Link tĩnh cạnh các nhóm dịch vụ — không nằm trong cây nên khai ở đây. */
const STATIC_ITEMS: StaticNavItem[] = [{ label: 'Giới thiệu', href: '/gioi-thieu' }]

export function Header({ settings, tree }: { settings: Setting | null; tree: TreeNode[] }) {
  return (
    <header className={styles.header}>
      <TopBar settings={settings} />
      <div className={styles.main}>
        <Container>
          <div className={styles.inner}>
            <Logo settings={settings} />
            <MegaMenu
              tree={tree}
              staticItems={STATIC_ITEMS}
              ctaLabel="Tư vấn miễn phí"
              ctaHref="/lien-he"
            />
          </div>
        </Container>
      </div>
    </header>
  )
}
