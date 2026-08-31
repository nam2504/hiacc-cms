import { Container } from '@/components/ui/Container'
import { t } from '@/lib/i18n'
import styles from './Stats.module.css'

/**
 * Khối 3 — AUDIT §3.3: 3 khối cam kết định tính (Giảm thiểu / Nâng cao / Tối ưu).
 *
 * Trước đây là 3 con số phần trăm chép từ site tham chiếu — đã gỡ vì không
 * kiểm chứng được. Nội dung tĩnh, chưa có collection tương ứng nên lấy qua t().
 * Nếu sau này khách muốn tự sửa → cần field trong Settings (ngoài quyền W1).
 */
const STATS = [
  { key: 'risk', value: 'home.stats.risk.value', label: 'home.stats.risk.label' },
  { key: 'efficiency', value: 'home.stats.efficiency.value', label: 'home.stats.efficiency.label' },
  { key: 'cost', value: 'home.stats.cost.value', label: 'home.stats.cost.label' },
] as const

export function Stats() {
  return (
    <section className={styles.stats}>
      <Container>
        <ul className={styles.list}>
          {STATS.map((stat) => (
            <li key={stat.key} className={styles.item}>
              <p className={styles.value}>{t(stat.value)}</p>
              <p className={styles.label}>{t(stat.label)}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
