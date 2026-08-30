import { Container } from '@/components/ui/Container'
import type { Setting } from '@/payload-types'
import { Logo } from './Logo'
import { MainNav } from './MainNav'
import { TopBar } from './TopBar'
import styles from './Header.module.css'

/**
 * Đầu trang: TopBar (liên hệ) + logo + menu. Dính trên cùng khi cuộn.
 * Server component — chỉ MainNav là client vì cần state đóng/mở menu mobile.
 */
export function Header({ settings }: { settings: Setting | null }) {
  return (
    <header className={styles.header}>
      <TopBar settings={settings} />
      <div className={styles.main}>
        <Container>
          <div className={styles.inner}>
            <Logo settings={settings} />
            <MainNav />
          </div>
        </Container>
      </div>
    </header>
  )
}
