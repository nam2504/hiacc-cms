import { Container } from '@/components/ui/Container'
import type { TreeNode } from '@/lib/serviceTree'
import type { Setting } from '@/payload-types'
import { Logo } from './Logo'
import { MegaMenu, type StaticNavItem } from './MegaMenu'
import { TopBar } from './TopBar'
import styles from './Header.module.css'
import { createTranslator } from '@/lib/i18n'

/**
 * Đầu trang: TopBar (liên hệ + link phụ) + logo + menu. Dính trên cùng khi cuộn.
 *
 * Cây dịch vụ đọc từ DB ở layout rồi truyền xuống — menu là 5 nhóm dịch vụ, khách
 * thêm nhóm trong /admin là menu đổi theo. Server component; chỉ MegaMenu là
 * client vì cần state đóng/mở.
 */

/** Link tĩnh cạnh các nhóm dịch vụ — không nằm trong cây nên khai ở đây. */
/** Nhãn dịch lúc render, không đóng băng ở tầng module. */
const STATIC_ITEM_KEYS = [{ labelKey: 'nav.about', href: '/gioi-thieu' }] as const

export function Header({
  settings,
  tree,
  locale,
}: {
  settings: Setting | null
  tree: TreeNode[]
  locale: string
}) {
  const tr = createTranslator(locale as Parameters<typeof createTranslator>[0])
  const staticItems = STATIC_ITEM_KEYS.map((item) => ({ label: tr(item.labelKey), href: item.href }))

  return (
    <header className={styles.header}>
      <TopBar settings={settings} />
      <div className={styles.main}>
        <Container>
          <div className={styles.inner}>
            <Logo settings={settings} />
            <MegaMenu
              locale={locale}
              tree={tree}
              staticItems={staticItems}
              ctaLabel={tr('home.services.consultCta')}
              ctaHref="/lien-he"
            />
          </div>
        </Container>
      </div>
    </header>
  )
}
