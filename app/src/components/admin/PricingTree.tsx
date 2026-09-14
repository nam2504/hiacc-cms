import type { ServerProps } from 'payload'
import { buildServiceTreeView } from './ServiceTree'
import { PricingTreeInteractive } from './PricingTreeInteractive'

/**
 * Sơ đồ cây dịch vụ gắn phía trên bảng danh sách của `pricing-plans`
 * (`admin.components.beforeListTable`), y hệt bố cục `ServiceTree.tsx` bên
 * `service-nodes` — dùng chung `buildServiceTreeView()` để đọc cây, chỉ khác
 * cách filter (xem `PricingTreeInteractive.tsx`).
 *
 * Vì sao cần: cột "Thuộc hạng mục dịch vụ" trong bảng `pricing-plans` là
 * relationship — Payload không cho lọc bảng theo cột đó bằng cách bấm/gõ tại
 * chỗ (giới hạn mặc định, đã ghi ở WS-6 14/09 khi thêm bảng giá tham khảo).
 * Sơ đồ này là lối lọc thay thế: bấm tên hạng mục → bảng bên dưới còn đúng
 * dòng giá của hạng mục đó.
 */

const styles = {
  wrap: {
    marginBottom: '1.5rem',
    padding: '1rem 1.25rem',
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: '4px',
    background: 'var(--theme-elevation-50)',
  },
  heading: { margin: '0 0 .25rem', fontSize: '1rem' },
  hint: { margin: '0 0 .75rem', fontSize: '.8125rem', color: 'var(--theme-elevation-600)' },
} as const

const PricingTree = async ({ payload }: ServerProps) => {
  if (!payload) return null

  const { nodes, childrenOf, rootCount, totalCount } = await buildServiceTreeView(payload)

  return (
    <div style={styles.wrap}>
      <h3 style={styles.heading}>Sơ đồ cây dịch vụ</h3>
      <p style={styles.hint}>
        {rootCount} nhóm cấp cao nhất, tổng {totalCount} mục. Bấm tên một hạng mục để lọc bảng
        giá bên dưới còn đúng dòng của hạng mục đó (cột &quot;Thuộc hạng mục dịch vụ&quot; không
        tự lọc được).
      </p>
      {totalCount === 0 ? (
        <p style={styles.hint}>Chưa có mục dịch vụ nào.</p>
      ) : (
        <PricingTreeInteractive nodes={nodes} childrenOf={childrenOf} />
      )}
    </div>
  )
}

export default PricingTree
