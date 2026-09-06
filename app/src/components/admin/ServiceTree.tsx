import type { ServerProps } from 'payload'

/**
 * Sơ đồ cây dịch vụ, gắn phía trên bảng danh sách của collection `service-nodes`
 * (`admin.components.beforeListTable`).
 *
 * Vì sao cần: dữ liệu thật là 5 nhóm gốc / 32 hạng mục con. Bảng phẳng 37 dòng
 * — kể cả khi đã `defaultSort: 'parent'` — không cho nhân viên thấy hạng mục nào
 * nằm trong nhóm nào; muốn biết phải đọc từng dòng ở cột "Thuộc nhóm". Khối này
 * vẽ đúng quan hệ cha–con để nhìn một lần là ra cấu trúc.
 *
 * Đây là khối CHỈ ĐỌC, cố ý đặt BÊN TRÊN bảng chứ không thay bảng: mọi thao tác
 * sửa/xoá/lọc/phân trang vẫn do bảng gốc của Payload lo. Không tự dựng lại các
 * thao tác đó nghĩa là không có đường nào bỏ qua được hook chặn vòng lặp và
 * chặn slug trùng route ở `ServiceNodes.ts` — mọi thay đổi vẫn đi qua form chuẩn.
 *
 * Server component: `payload` lấy thẳng từ ServerProps, không gọi REST nên không
 * cần cookie/token và không thêm một vòng mạng nào.
 */

/** Trần đệ quy. Cây thật sâu 2 tầng; chạm mốc này nghĩa là dữ liệu đã hỏng. */
const MAX_DEPTH = 10

/** Kéo hết cây trong một truy vấn. 37 node hiện tại, chừa dư cho lúc khách thêm. */
const FETCH_LIMIT = 500

type NodeRow = {
  id: number | string
  title?: string | null
  slug?: string | null
  order?: number | null
  parentId: string | null
}

/**
 * `parent` về dạng nào tuỳ `depth` của truy vấn và tuỳ node có cha hay không:
 * có thể là số, chuỗi, object đã populate, hoặc null. Quy hết về chuỗi id để so
 * sánh được, vì SQLite trả id kiểu số còn khoá của Map là chuỗi.
 */
const parentKeyOf = (parent: unknown): string | null => {
  if (parent === null || parent === undefined) return null
  if (typeof parent === 'object') {
    const id = (parent as { id?: unknown }).id
    return id === null || id === undefined ? null : String(id)
  }
  return String(parent)
}

/** Số nhỏ hiện trước; cùng số thì theo tên — khớp cách site public sắp xếp. */
const byOrderThenTitle = (a: NodeRow, b: NodeRow) => {
  const diff = (a.order ?? 0) - (b.order ?? 0)
  if (diff !== 0) return diff
  return (a.title ?? '').localeCompare(b.title ?? '', 'vi')
}

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
  list: { margin: 0, padding: 0, listStyle: 'none' },
  rootRow: { padding: '.3rem 0', fontWeight: 600 },
  childRow: { padding: '.15rem 0' },
  slug: { color: 'var(--theme-elevation-500)', fontSize: '.8125rem', marginLeft: '.4rem' },
  orphanNote: {
    marginTop: '.75rem',
    fontSize: '.8125rem',
    color: 'var(--theme-error-500)',
  },
} as const

const ServiceTree = async ({ payload }: ServerProps) => {
  // Component chạy ở mọi view có beforeListTable; không có payload thì im lặng
  // biến mất, không làm hỏng trang danh sách.
  if (!payload) return null

  const { docs } = await payload.find({
    collection: 'service-nodes',
    limit: FETCH_LIMIT,
    // depth 0: chỉ cần id của cha, không cần kéo cả bản ghi cha về.
    depth: 0,
    pagination: false,
  })

  const rows: NodeRow[] = docs.map((doc) => ({
    id: doc.id,
    title: doc.title,
    slug: doc.slug,
    order: doc.order,
    parentId: parentKeyOf(doc.parent),
  }))

  const childrenOf = new Map<string | null, NodeRow[]>()
  const knownIds = new Set(rows.map((row) => String(row.id)))

  for (const row of rows) {
    /**
     * Cha trỏ tới bản ghi không còn tồn tại (bị xoá trong lúc con vẫn trỏ tới)
     * thì coi như gốc — nếu không, node đó không xuất hiện ở đâu cả và nhân
     * viên tưởng dữ liệu đã mất.
     */
    const key = row.parentId && knownIds.has(row.parentId) ? row.parentId : null
    const bucket = childrenOf.get(key)
    if (bucket) bucket.push(row)
    else childrenOf.set(key, [row])
  }

  for (const bucket of childrenOf.values()) bucket.sort(byOrderThenTitle)

  const detached = rows.filter((row) => row.parentId && !knownIds.has(row.parentId)).length

  const renderLevel = (parentId: string | null, depth: number) => {
    const children = childrenOf.get(parentId)
    if (!children || depth > MAX_DEPTH) return null

    return (
      <ul style={styles.list}>
        {children.map((row) => (
          <li key={String(row.id)} style={{ paddingLeft: depth === 0 ? 0 : '1.25rem' }}>
            <div style={depth === 0 ? styles.rootRow : styles.childRow}>
              <span aria-hidden="true" style={{ marginRight: '.4rem' }}>
                {depth === 0 ? '▸' : '·'}
              </span>
              {row.title || '(chưa đặt tên)'}
              {row.slug ? <span style={styles.slug}>/{row.slug}</span> : null}
            </div>
            {renderLevel(String(row.id), depth + 1)}
          </li>
        ))}
      </ul>
    )
  }

  const rootCount = childrenOf.get(null)?.length ?? 0

  return (
    <div style={styles.wrap}>
      <h3 style={styles.heading}>Sơ đồ cây dịch vụ</h3>
      <p style={styles.hint}>
        {rootCount} nhóm cấp cao nhất, tổng {rows.length} mục. Mục thụt vào là hạng mục con của
        mục ngay trên nó. Đây là bảng nhìn cho dễ — muốn sửa thì bấm vào dòng tương ứng ở bảng
        bên dưới.
      </p>
      {rows.length === 0 ? (
        <p style={styles.hint}>Chưa có mục dịch vụ nào.</p>
      ) : (
        renderLevel(null, 0)
      )}
      {detached > 0 ? (
        <p style={styles.orphanNote}>
          {detached} mục đang trỏ tới một nhóm cha không còn tồn tại, tạm xếp ở cấp cao nhất. Mở
          từng mục đó và chọn lại &quot;Thuộc nhóm&quot;.
        </p>
      ) : null}
    </div>
  )
}

export default ServiceTree
