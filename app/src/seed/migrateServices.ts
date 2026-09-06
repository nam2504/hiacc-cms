import type { Payload } from 'payload'

/**
 * Chuyển nội dung 7 dịch vụ của cấu trúc cũ (`/dich-vu/<slug>`) sang cây mới.
 *
 * Vì sao cần: cấu trúc cũ là danh sách phẳng, cấu trúc mới là cây 5 nhóm. Sáu
 * trong bảy dịch vụ cũ trùng slug với hạng mục thuộc nhóm Kế toán, nên nội dung
 * khách đã nhập vẫn dùng được — bỏ đi là mất công sức của họ.
 *
 * Nguyên tắc: KHÔNG xoá bản ghi cũ, KHÔNG đè nội dung đã có trong cây. Chỉ điền
 * vào chỗ còn trống. Chạy lại nhiều lần cho cùng kết quả.
 *
 * Collection `services` giữ nguyên trong repo cho tới khi xác nhận không còn ai
 * tham chiếu; xoá nó là việc riêng, không gộp vào lần chuyển dữ liệu này.
 */

/** Slug cũ → slug trong cây. Chỉ khai những cặp KHÁC nhau. */
const SLUG_MAP: Record<string, string> = {
  'soat-xet-ho-so': 'kiem-tra-soat-xet-ho-so-ke-toan',
}

/** RichText Lexical rỗng thì coi như chưa có nội dung. */
function isEmptyRichText(value: unknown): boolean {
  if (!value || typeof value !== 'object') return true
  const root = (value as { root?: { children?: unknown[] } }).root
  if (!root || !Array.isArray(root.children) || root.children.length === 0) return true
  return root.children.every((child) => {
    const node = child as { type?: string; children?: unknown[] }
    return node.type === 'paragraph' && (!node.children || node.children.length === 0)
  })
}

export async function migrateServicesToTree(payload: Payload): Promise<void> {
  let moved = 0
  let skipped = 0
  const unmatched: string[] = []

  const services = await payload.find({ collection: 'services', limit: 200, depth: 1 })

  for (const service of services.docs) {
    const targetSlug = SLUG_MAP[service.slug] ?? service.slug

    const found = await payload.find({
      collection: 'service-nodes',
      where: { slug: { equals: targetSlug } },
      limit: 1,
      depth: 0,
    })
    const node = found.docs[0]

    if (!node) {
      unmatched.push(service.slug)
      continue
    }

    // Chỉ chuyển những ô trong cây còn trống. Nội dung khách sửa trong cây luôn
    // thắng bản cũ — bản cũ là thứ đang bị thay thế.
    const data: Record<string, unknown> = {}

    if (!node.summary?.trim() && service.summary?.trim()) {
      data.summary = service.summary
    }

    if (!node.image && service.image) {
      data.image = typeof service.image === 'object' ? service.image.id : service.image
    }

    /**
     * Nội dung chi tiết cũ là một khối richText. Cây dùng khối lắp ghép, nên gói
     * nó vào block `richTextBlock` — giữ nguyên chữ, người nhập tách thành bảng
     * giá hay danh sách sau nếu muốn.
     */
    if ((node.body?.length ?? 0) === 0 && !isEmptyRichText(service.content)) {
      data.body = [
        {
          blockType: 'richTextBlock',
          title: 'Nội dung dịch vụ',
          content: service.content,
        },
      ]
    }

    if (Object.keys(data).length === 0) {
      skipped += 1
      continue
    }

    await payload.update({ collection: 'service-nodes', id: node.id, data })
    moved += 1
  }

  console.log(
    `[migrate] dịch vụ cũ → cây: chuyển ${moved}, bỏ qua ${skipped} (cây đã có nội dung).`,
  )
  if (unmatched.length > 0) {
    console.warn(
      `[migrate] ⚠️ ${unmatched.length} dịch vụ cũ không tìm thấy hạng mục tương ứng trong cây: ${unmatched.join(', ')}. Nội dung của chúng CHƯA được chuyển — thêm hạng mục vào cây rồi chạy lại, hoặc khai cặp slug trong SLUG_MAP.`,
    )
  }
}
