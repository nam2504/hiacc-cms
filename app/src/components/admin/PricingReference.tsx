import type { UIFieldServerComponent } from 'payload'

/**
 * Bảng giá tham khảo (CHỈ ĐỌC) hiện ngay trong form edit của một hạng mục dịch
 * vụ (`service-nodes`), gắn bằng `admin.components.Field` kiểu field `ui`
 * (xem `ServiceNodes.ts`).
 *
 * Vì sao cần: sau khi đảo kiến trúc (14/09), giá KHÔNG còn nằm trong `body` của
 * trang này nữa — nguồn duy nhất là collection `pricing-plans`, lọc theo
 * `serviceNode`. Không có khối này thì muốn biết hạng mục đang có giá gì phải
 * mở tab khác, tìm đúng dòng theo tên — mất công đối chiếu thủ công.
 *
 * Cố ý CHỈ ĐỌC, không cho sửa tại đây: sửa vẫn phải qua `pricing-plans` để giữ
 * đúng nguyên tắc "một nguồn duy nhất" (xem PricingPlans.ts) — trộn 2 đường sửa
 * sẽ tạo ra dữ liệu lệch nhau mà không ai biết dòng nào mới nhất.
 *
 * `id` chỉ có khi đang sửa document đã tồn tại; document mới tạo (`id`
 * undefined) chưa thể có dòng giá nào gắn vào — không render gì.
 */
const PricingReference: UIFieldServerComponent = async ({ id, payload }) => {
  if (!id) return null

  const { docs } = await payload.find({
    collection: 'pricing-plans',
    where: { serviceNode: { equals: id } },
    depth: 0,
    limit: 100,
    sort: 'order',
  })

  return (
    <div
      style={{
        marginBottom: '1.5rem',
        padding: '1rem 1.25rem',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '4px',
        background: 'var(--theme-elevation-50)',
      }}
    >
      <h3 style={{ margin: '0 0 .25rem', fontSize: '1rem' }}>Bảng giá tham khảo</h3>
      <p style={{ margin: '0 0 .75rem', fontSize: '.8125rem', color: 'var(--theme-elevation-600)' }}>
        Chỉ để xem. Sửa giá thì vào collection &quot;Bảng giá&quot; (pricing-plans), lọc theo hạng
        mục này.
      </p>
      {docs.length === 0 ? (
        <p style={{ margin: 0, fontSize: '.8125rem', color: 'var(--theme-elevation-500)' }}>
          Hạng mục này chưa có dòng giá nào.
        </p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.8125rem' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '.375rem .5rem', borderBottom: '1px solid var(--theme-elevation-150)' }}>
                Hạng mục
              </th>
              <th style={{ textAlign: 'left', padding: '.375rem .5rem', borderBottom: '1px solid var(--theme-elevation-150)' }}>
                Phạm vi
              </th>
              <th style={{ textAlign: 'left', padding: '.375rem .5rem', borderBottom: '1px solid var(--theme-elevation-150)' }}>
                Phí
              </th>
            </tr>
          </thead>
          <tbody>
            {docs.map((doc) => (
              <tr key={doc.id}>
                <td style={{ padding: '.375rem .5rem', borderBottom: '1px solid var(--theme-elevation-100)' }}>
                  {doc.item}
                </td>
                <td style={{ padding: '.375rem .5rem', borderBottom: '1px solid var(--theme-elevation-100)' }}>
                  {doc.scope}
                </td>
                <td style={{ padding: '.375rem .5rem', borderBottom: '1px solid var(--theme-elevation-100)' }}>
                  {doc.fee}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default PricingReference
