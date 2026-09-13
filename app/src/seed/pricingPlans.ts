import type { Payload } from 'payload'

/**
 * Seed bảng giá — trang `/bang-gia` trước 13/09 là `EmptyState` vì collection
 * `pricing-plans` chưa từng có bản ghi nào (không phải bug, chỉ là chưa seed).
 *
 * Giá THẬT do khách cấp (Decisions locked: "Bảng giá... Đang cập nhật" — 06/09).
 * Mỗi nhóm dịch vụ gốc có đúng 1 gói placeholder để trang có nội dung demo,
 * không bịa số tiền. Khách tự sửa/thêm gói thật trong admin.
 *
 * Idempotent: tra theo cặp (name, serviceGroup) — đã có thì bỏ qua.
 */
const PLACEHOLDER_PLANS: Array<{ groupSlug: string; name: string }> = [
  { groupSlug: 'ke-toan', name: 'Kế toán trọn gói' },
  { groupSlug: 'thanh-lap', name: 'Thành lập doanh nghiệp' },
  { groupSlug: 'thay-doi-dkkd', name: 'Thay đổi đăng ký kinh doanh' },
  { groupSlug: 'giay-phep-hoat-dong', name: 'Giấy phép hoạt động' },
  { groupSlug: 'dich-vu-khac', name: 'Dịch vụ khác' },
]

export async function seedPricingPlans(payload: Payload): Promise<void> {
  let created = 0
  let skipped = 0

  for (const [index, plan] of PLACEHOLDER_PLANS.entries()) {
    const group = await payload.find({
      collection: 'service-nodes',
      where: { slug: { equals: plan.groupSlug }, parent: { exists: false } },
      limit: 1,
      depth: 0,
    })
    const groupDoc = group.docs[0]
    if (!groupDoc) {
      payload.logger.warn(`Bỏ qua gói giá "${plan.name}": không tìm thấy nhóm dịch vụ ${plan.groupSlug}`)
      continue
    }

    const existing = await payload.find({
      collection: 'pricing-plans',
      where: { name: { equals: plan.name }, serviceGroup: { equals: groupDoc.id } },
      limit: 1,
      depth: 0,
    })
    if (existing.docs.length > 0) {
      skipped += 1
      continue
    }

    await payload.create({
      collection: 'pricing-plans',
      data: {
        name: plan.name,
        serviceGroup: groupDoc.id,
        price: 'Đang cập nhật',
        summary: 'Liên hệ để được báo giá phù hợp với quy mô doanh nghiệp.',
        order: (index + 1) * 10,
      },
    })
    created += 1
  }

  console.log(`[seed] bảng giá: tạo mới ${created}, bỏ qua ${skipped} (đã có).`)
}
