import type { ServerProps } from 'payload'
import { ServiceTreeInteractive, type TreeNodeView } from './ServiceTreeInteractive'

/**
 * Sơ đồ cây dịch vụ, gắn phía trên bảng danh sách của collection `service-nodes`
 * (`admin.components.beforeListTable`).
 *
 * Vì sao cần: dữ liệu thật là 5 nhóm gốc / 32 hạng mục con. Bảng phẳng 37 dòng
 * — kể cả khi đã `defaultSort: 'parent'` — không cho nhân viên thấy hạng mục nào
 * nằm trong nhóm nào; muốn biết phải đọc từng dòng ở cột "Thuộc nhóm". Khối này
 * vẽ đúng quan hệ cha–con để nhìn một lần là ra cấu trúc, xổ/thu được từng nhóm,
 * và click 1 mục để lọc bảng bên dưới còn đúng dòng đó.
 *
 * Việc XỔ/THU + CLICK LỌC nằm ở `ServiceTreeInteractive` (client component) vì
 * cần state và router. Component này (server) chỉ lo fetch + build quan hệ
 * cha–con rồi truyền xuống dạng dữ liệu thuần (id/tên/slug), không truyền hàm
 * hay JSX phức tạp — giữ ranh giới server/client rõ ràng.
 *
 * Đây là khối CHỈ ĐỌC dữ liệu cây, cố ý đặt BÊN TRÊN bảng chứ không thay bảng:
 * mọi thao tác sửa/xoá/phân trang vẫn do bảng gốc của Payload lo — lọc cũng đi
 * qua đúng cơ chế URL query (`where[id][equals]`) mà bảng đó tự đọc, không tự
 * dựng lại bảng hay gọi thêm API. Không có đường nào bỏ qua được hook chặn vòng
 * lặp và chặn slug trùng route ở `ServiceNodes.ts` — mọi thay đổi vẫn đi qua
 * form chuẩn.
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

  /**
   * Quy `childrenOf` (Map, khoá `null` cho gốc) về dạng thuần Record để truyền
   * qua props cho client component — gốc dùng khoá chuỗi `'__root__'` vì key
   * object/`null` không truyền được qua ranh giới server/client. Đồng thời gán
   * `depth` cho từng node bằng đúng 1 lượt duyệt cây (không đệ quy 2 lần).
   */
  const nodes: TreeNodeView[] = []
  const childrenOfPlain: Record<string, string[]> = {}

  const walk = (parentId: string | null, depth: number) => {
    const children = childrenOf.get(parentId)
    if (!children || depth > MAX_DEPTH) return
    const key = parentId ?? '__root__'
    childrenOfPlain[key] = children.map((row) => String(row.id))
    for (const row of children) {
      nodes.push({
        id: String(row.id),
        title: row.title || '(chưa đặt tên)',
        slug: row.slug ?? null,
        depth,
      })
      walk(String(row.id), depth + 1)
    }
  }
  walk(null, 0)

  const rootCount = childrenOf.get(null)?.length ?? 0

  return (
    <div style={styles.wrap}>
      <h3 style={styles.heading}>Sơ đồ cây dịch vụ</h3>
      <p style={styles.hint}>
        {rootCount} nhóm cấp cao nhất, tổng {rows.length} mục. Các nhóm đang thu gọn — bấm mũi
        tên để xổ ra. Bấm tên một nhóm để lọc bảng bên dưới còn nhóm đó và toàn bộ hạng mục
        trong nó; bấm tên một hạng mục để lọc còn đúng dòng đó.
      </p>
      {rows.length === 0 ? (
        <p style={styles.hint}>Chưa có mục dịch vụ nào.</p>
      ) : (
        <ServiceTreeInteractive nodes={nodes} childrenOf={childrenOfPlain} />
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
