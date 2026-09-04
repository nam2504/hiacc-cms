import { Container } from '@/components/ui/Container'
import { t } from '@/lib/i18n'
import type { Setting } from '@/payload-types'
import styles from './Stats.module.css'

/**
 * Khối 3 — AUDIT §3.3: 3 khối cam kết định tính (Giảm thiểu / Nâng cao / Tối ưu).
 *
 * Trước đây là 3 con số phần trăm chép từ site tham chiếu — đã gỡ vì không
 * kiểm chứng được. Nay khách sửa được trong admin (Cấu hình chung → Trang chủ →
 * Dải cam kết); mảng để trống thì dùng lại 3 ô mặc định bên dưới.
 */
const DEFAULT_STATS = [
  { key: 'risk', value: 'home.stats.risk.value', label: 'home.stats.risk.label' },
  { key: 'efficiency', value: 'home.stats.efficiency.value', label: 'home.stats.efficiency.label' },
  { key: 'cost', value: 'home.stats.cost.value', label: 'home.stats.cost.label' },
] as const

export function Stats({ settings }: { settings?: Setting | null }) {
  const custom = settings?.home?.stats

  // Chỉ nhận hàng có ĐỦ cả hai dòng: một ô thiếu dòng mô tả hiện ra là một ô
  // cụt giữa hàng, xấu hơn hẳn so với việc bỏ qua nó.
  const items =
    custom && custom.length > 0
      ? custom
          .filter((row) => row.value && row.label)
          .map((row) => ({ key: row.id ?? row.value!, value: row.value!, label: row.label! }))
      : DEFAULT_STATS.map((s) => ({ key: s.key, value: t(s.value), label: t(s.label) }))

  // Khách xoá hết / điền dở toàn bộ → ẩn khối thay vì để dải trống giữa trang.
  if (items.length === 0) return null

  return (
    <section className={styles.stats}>
      <Container>
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.key} className={styles.item}>
              <p className={styles.value}>{item.value}</p>
              <p className={styles.label}>{item.label}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
