import { cache } from 'react'
import type { ServiceNode } from '@/payload-types'
import { getPayloadClient, mediaUrl, toPayloadLocale } from '@/lib/site'
import { DEFAULT_LOCALE, type LocaleCode } from '@/lib/locales'

/**
 * Đọc cây dịch vụ và giải đường dẫn.
 *
 * Cách làm: nạp TOÀN BỘ node trong một truy vấn rồi dựng cây trong bộ nhớ, thay
 * vì truy vấn từng tầng. Cây dịch vụ là dữ liệu nhỏ (5 nhóm / 32 hạng mục ≈ 40
 * bản ghi) và mọi trang đều cần nó để dựng menu — nạp một lần rẻ hơn nhiều so
 * với chuỗi truy vấn theo tầng, và tránh luôn N+1 khi render mega-menu.
 */

export type TreeNode = {
  id: string
  title: string
  slug: string
  /** Đường dẫn đầy đủ tính từ gốc, đã có dấu "/" đầu. Ví dụ: /ke-toan/quyet-toan-thue */
  path: string
  order: number
  icon?: string | null
  summary?: string | null
  children: TreeNode[]
}

type RawNode = Pick<ServiceNode, 'id' | 'title' | 'slug' | 'order' | 'icon' | 'summary'> & {
  parent?: unknown
}

const idOf = (value: unknown): string | null => {
  if (!value) return null
  if (typeof value === 'object') {
    const id = (value as { id?: unknown }).id
    return id == null ? null : String(id)
  }
  return String(value)
}

/** Nạp mọi node một lần. Lỗi DB trả cây rỗng — menu trống còn hơn cả site sập. */
async function fetchNodes(locale: LocaleCode): Promise<RawNode[]> {
  try {
    const payload = await getPayloadClient()
    const res = await payload.find({
      collection: 'service-nodes',
      // Cây thật ~40 bản ghi. Đặt 500 để không bị cắt âm thầm khi khách thêm mục,
      // nhưng vẫn có trần để một lỗi dữ liệu không kéo về hàng vạn dòng.
      limit: 500,
      /**
       * depth 0 + `select`: chỉ kéo đúng những cột cần để dựng cây và menu.
       *
       * Trước đây để depth 1 cho tiện lấy URL ảnh, nhưng cây này chạy ở LAYOUT
       * nên mọi trang đều gánh: 37 node × toàn bộ bản ghi media lồng nhau (kèm
       * mọi imageSizes) làm trang chủ chậm dần 3.9s → 16.8s và server phình lên
       * 1.5GB. Ảnh nhóm nay lấy riêng bằng getGroupImages() — chỉ trang chủ cần.
       */
      depth: 0,
      select: {
        title: true,
        slug: true,
        order: true,
        icon: true,
        summary: true,
        parent: true,
      },
      locale: toPayloadLocale(locale),
      sort: 'order',
    })
    return res.docs as RawNode[]
  } catch (error) {
    console.error('[serviceTree] không đọc được cây dịch vụ:', error)
    return []
  }
}

function buildTree(rows: RawNode[]): TreeNode[] {
  const byId = new Map<string, TreeNode>()
  const parentOf = new Map<string, string | null>()

  for (const row of rows) {
    const id = String(row.id)
    byId.set(id, {
      id,
      title: row.title,
      slug: row.slug,
      path: '',
      order: row.order ?? 0,
      icon: row.icon,
      summary: row.summary,
      children: [],
    })
    parentOf.set(id, idOf(row.parent))
  }

  const roots: TreeNode[] = []
  for (const [id, node] of byId) {
    const parentId = parentOf.get(id) ?? null
    const parent = parentId ? byId.get(parentId) : undefined
    // Node trỏ tới cha đã bị xoá thì coi như gốc — mất một tầng còn hơn mất hẳn
    // khỏi menu, vì khách sẽ không hiểu vì sao mục vừa nhập không hiện ra.
    if (parent) parent.children.push(node)
    else roots.push(node)
  }

  const sortRec = (nodes: TreeNode[], prefix: string) => {
    nodes.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, 'vi'))
    for (const node of nodes) {
      node.path = `${prefix}/${node.slug}`
      sortRec(node.children, node.path)
    }
  }
  sortRec(roots, '')

  return roots
}

/**
 * Cây đầy đủ, dùng cho menu, sitemap và trang chủ.
 *
 * Bọc `cache()` của React: trong MỘT request, layout dựng menu và trang dựng nội
 * dung đều gọi hàm này. Không có cache thì mỗi lần gọi là một lượt quét bảng —
 * đo được 2 lượt cho mỗi trang cây dịch vụ. Cache chỉ sống trong phạm vi một
 * request nên không giữ dữ liệu cũ giữa các lần tải trang.
 */
export const getServiceTree = cache(
  async (locale: LocaleCode = DEFAULT_LOCALE): Promise<TreeNode[]> => {
    return buildTree(await fetchNodes(locale))
  },
)

export type NodeMatch = {
  node: TreeNode
  /** Chuỗi tổ tiên tính từ gốc tới chính nó — dùng dựng breadcrumb. */
  trail: TreeNode[]
  /** Node gốc của nhánh, tức nhóm hiện trên thanh menu. */
  root: TreeNode
}

/** Giải mảng slug từ URL thành node. Không khớp thì trả null để trang trả 404 thật. */
export function findByPath(tree: TreeNode[], segments: string[]): NodeMatch | null {
  if (segments.length === 0) return null

  const trail: TreeNode[] = []
  let level = tree
  let current: TreeNode | undefined

  for (const segment of segments) {
    current = level.find((node) => node.slug === segment)
    if (!current) return null
    trail.push(current)
    level = current.children
  }

  return current ? { node: current, trail, root: trail[0] } : null
}

/** Mọi đường dẫn trong cây — cho sitemap. */
export function flatten(tree: TreeNode[]): TreeNode[] {
  return tree.flatMap((node) => [node, ...flatten(node.children)])
}

/**
 * URL ảnh của các node theo id — tách khỏi `getServiceTree` vì chỉ trang chủ cần
 * ảnh, còn cây thì mọi trang đều nạp qua layout. Gộp vào cây sẽ bắt cả site trả
 * giá cho dữ liệu mà 90% số trang không dùng.
 */
export const getNodeImages = cache(async (ids: string[]): Promise<Record<string, string>> => {
  if (ids.length === 0) return {}
  try {
    const payload = await getPayloadClient()
    const res = await payload.find({
      collection: 'service-nodes',
      where: { id: { in: ids } },
      limit: ids.length,
      depth: 1,
      select: { image: true },
    })
    const map: Record<string, string> = {}
    for (const doc of res.docs) {
      const url = mediaUrl((doc as { image?: unknown }).image as Parameters<typeof mediaUrl>[0])
      if (url) map[String(doc.id)] = url
    }
    return map
  } catch (error) {
    console.error('[serviceTree] không đọc được ảnh mục dịch vụ:', error)
    return {}
  }
})
