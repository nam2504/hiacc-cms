import type { Payload } from 'payload'
import { SERVICE_CONTENT, GROUP_HERO_STATS } from './serviceContent'

/**
 * Seed CÂY dịch vụ — 5 nhóm / 32 hạng mục, lấy đúng từ `SET WEB.xlsx` khách gửi
 * 06/09 (sheet PAGE, KẾ TOÁN, THÀNH LẬP, THAY ĐỔI DKKD, GP HOẠT ĐỘNG, DV KHÁC).
 *
 * ⚠️ TÊN hạng mục là thật (khách viết ra). NỘI DUNG bên trong là MẪU — khách ghi
 * trong Excel 2 lần "Thông tin chi tiết e sẽ up vào sau ạ". Không bịa số liệu:
 * bảng giá chỉ seed cho hạng mục nào khách đã ghi giá trong tài liệu, còn lại để
 * trống có chú thích. Dự án này đã một lần phải đi gỡ số bịa (WS-6 task C2).
 *
 * Idempotent: tra theo slug, đã có thì bỏ qua. Chạy nhiều lần không nhân bản.
 */

type NodeSeed = {
  slug: string
  title: string
  summary?: string
  icon?: string
  children?: NodeSeed[]
}

/** Chú thích chung cho mọi hạng mục chưa có nội dung thật. */
const PENDING = 'Nội dung chi tiết đang được cập nhật.'

export const SERVICE_TREE: NodeSeed[] = [
  {
    slug: 'ke-toan',
    title: 'Kế toán',
    icon: 'finance',
    summary:
      'Kế toán trọn gói, kế toán nội bộ, soát xét hồ sơ, quyết toán thuế và báo cáo tài chính.',
    children: [
      { slug: 'ke-toan-tron-goi', title: 'Kế toán trọn gói', summary: PENDING },
      { slug: 'ke-toan-noi-bo', title: 'Kế toán nội bộ', summary: PENDING },
      { slug: 'kiem-tra-soat-xet-ho-so-ke-toan', title: 'Kiểm tra soát xét hồ sơ kế toán', summary: PENDING },
      { slug: 'quyet-toan-thue', title: 'Quyết toán thuế', summary: PENDING },
      { slug: 'hoan-thue-gtgt', title: 'Hoàn thuế GTGT', summary: PENDING },
      { slug: 'quyet-toan-giai-the', title: 'Quyết toán giải thể', summary: PENDING },
      { slug: 'bao-cao-tai-chinh', title: 'Báo cáo tài chính', summary: PENDING },
    ],
  },
  {
    slug: 'thanh-lap',
    title: 'Thành lập',
    icon: 'growth',
    summary:
      'Thành lập công ty, chi nhánh, văn phòng đại diện, hộ kinh doanh và doanh nghiệp có vốn nước ngoài.',
    children: [
      { slug: 'thanh-lap-cong-ty', title: 'Thành lập công ty', summary: PENDING },
      { slug: 'thanh-lap-chi-nhanh-dia-diem-kinh-doanh', title: 'Thành lập chi nhánh, địa điểm kinh doanh', summary: PENDING },
      { slug: 'thanh-lap-van-phong-dai-dien', title: 'Thành lập văn phòng đại diện', summary: PENDING },
      { slug: 'thanh-lap-ho-kinh-doanh', title: 'Thành lập hộ kinh doanh', summary: PENDING },
      { slug: 'thanh-lap-cong-ty-von-nuoc-ngoai', title: 'Thành lập công ty có vốn nước ngoài', summary: PENDING },
    ],
  },
  {
    slug: 'thay-doi-dkkd',
    title: 'Thay đổi ĐKKD',
    icon: 'document',
    summary:
      'Thủ tục thay đổi nội dung đăng ký doanh nghiệp: tên, địa chỉ, ngành nghề, vốn, cổ đông, loại hình.',
    children: [
      { slug: 'thay-doi-ten', title: 'Thay đổi tên', summary: PENDING },
      { slug: 'thay-doi-dia-chi', title: 'Thay đổi địa chỉ', summary: PENDING },
      { slug: 'bo-sung-nganh-nghe', title: 'Bổ sung ngành nghề', summary: PENDING },
      { slug: 'tang-giam-von-dieu-le', title: 'Tăng, giảm vốn điều lệ', summary: PENDING },
      { slug: 'thay-doi-co-dong', title: 'Thay đổi cổ đông', summary: PENDING },
      { slug: 'thay-doi-dai-dien-phap-luat', title: 'Thay đổi đại diện pháp luật', summary: PENDING },
      { slug: 'thay-doi-loai-hinh-cong-ty', title: 'Thay đổi loại hình công ty', summary: PENDING },
      { slug: 'cap-nhat-thong-tin-cong-ty', title: 'Cập nhật thông tin công ty', summary: PENDING },
      { slug: 'tam-ngung-hoat-dong', title: 'Tạm ngừng hoạt động', summary: PENDING },
    ],
  },
  {
    slug: 'giay-phep-hoat-dong',
    title: 'Giấy phép hoạt động',
    icon: 'archive',
    summary: 'Xin cấp giấy phép cho các ngành nghề kinh doanh có điều kiện.',
    children: [
      { slug: 'gp-du-lich-lu-hanh', title: 'Giấy phép du lịch lữ hành', summary: PENDING },
      { slug: 'gp-kinh-doanh-ruou', title: 'Giấy phép kinh doanh rượu', summary: PENDING },
      { slug: 'gp-ve-sinh-an-toan-thuc-pham', title: 'Giấy phép vệ sinh an toàn thực phẩm', summary: PENDING },
      { slug: 'gp-kinh-doanh-van-tai', title: 'Giấy phép kinh doanh vận tải', summary: PENDING },
      { slug: 'gp-cho-thue-lai-lao-dong', title: 'Giấy phép cho thuê lại lao động', summary: PENDING },
    ],
  },
  {
    slug: 'dich-vu-khac',
    title: 'Dịch vụ khác',
    icon: 'folder',
    summary:
      'Visa, giấy phép lao động, nhãn hiệu, bảo hiểm xã hội, dấu — biển và chữ ký số.',
    children: [
      { slug: 'xin-visa', title: 'Xin visa', summary: PENDING },
      { slug: 'xin-cap-giay-phep-lao-dong', title: 'Xin cấp giấy phép lao động', summary: PENDING },
      { slug: 'dang-ky-nhan-hieu', title: 'Đăng ký nhãn hiệu', summary: PENDING },
      { slug: 'bao-hiem-xa-hoi', title: 'Bảo hiểm xã hội', summary: PENDING },
      { slug: 'dau-bien', title: 'Dấu, biển', summary: PENDING },
      { slug: 'chu-ky-so', title: 'Chữ ký số (CKS)', summary: PENDING },
    ],
  },
]

async function findBySlug(payload: Payload, slug: string) {
  const res = await payload.find({
    collection: 'service-nodes',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })
  return res.docs[0] ?? null
}

export async function seedServiceTree(payload: Payload): Promise<void> {
  let created = 0
  let skipped = 0

  for (const [groupIndex, group] of SERVICE_TREE.entries()) {
    let parentDoc = await findBySlug(payload, group.slug)

    if (parentDoc) {
      skipped += 1
    } else {
      parentDoc = await payload.create({
        collection: 'service-nodes',
        data: {
          title: group.title,
          slug: group.slug,
          summary: group.summary,
          icon: group.icon,
          order: (groupIndex + 1) * 10,
        },
      })
      created += 1
    }

    for (const [childIndex, child] of (group.children ?? []).entries()) {
      const existing = await findBySlug(payload, child.slug)
      if (existing) {
        skipped += 1
        continue
      }
      await payload.create({
        collection: 'service-nodes',
        data: {
          title: child.title,
          slug: child.slug,
          summary: child.summary,
          parent: parentDoc.id,
          order: (childIndex + 1) * 10,
        },
      })
      created += 1
    }
  }

  const filled = await fillServiceContent(payload)
  console.log(
    `[seed] cây dịch vụ: tạo mới ${created}, bỏ qua ${skipped} (đã có), điền nội dung mẫu ${filled}.`,
  )
}

/**
 * Điền nội dung mẫu và dải số liệu. Chỉ ghi vào ô CÒN TRỐNG — khách sửa rồi thì
 * chạy lại seed không đè mất công sức của họ.
 */
async function fillServiceContent(payload: Payload): Promise<number> {
  let filled = 0

  for (const [slug, stats] of Object.entries(GROUP_HERO_STATS)) {
    const doc = await findBySlug(payload, slug)
    if (!doc || (doc.heroStats?.length ?? 0) > 0) continue
    await payload.update({ collection: 'service-nodes', id: doc.id, data: { heroStats: stats } })
    filled += 1
  }

  for (const item of SERVICE_CONTENT) {
    const doc = await findBySlug(payload, item.slug)
    if (!doc || (doc.body?.length ?? 0) > 0) continue

    const body = item.blocks.map((block) => {
      switch (block.type) {
        case 'pricingTable':
          return {
            blockType: 'pricingTable' as const,
            title: block.title,
            note: block.note,
            rows: block.rows.map((row) => ({ item: row.item, scope: row.scope, fee: row.fee })),
          }
        case 'bulletList':
          return {
            blockType: 'bulletList' as const,
            title: block.title,
            items: block.items.map((text) => ({ text })),
          }
        case 'fieldTable':
          return {
            blockType: 'fieldTable' as const,
            title: block.title,
            rows: block.rows.map((row) => ({ label: row.label, value: row.value })),
          }
      }
    })

    /**
     * Chỉ ghi `summary` khi ô đó ĐANG TRỐNG hoặc còn là chuỗi báo "đang cập nhật"
     * do chính seed đặt. Trước đây guard chỉ xét `body` rồi ghi luôn `summary`,
     * nên khách viết mô tả xong mà chưa nhập nội dung chi tiết thì lần seed sau
     * ăn mất câu họ viết.
     */
    const summaryIsSeeded = !doc.summary?.trim() || doc.summary.trim() === PENDING
    await payload.update({
      collection: 'service-nodes',
      id: doc.id,
      data: {
        ...(summaryIsSeeded && item.summary ? { summary: item.summary } : {}),
        body,
      },
    })
    filled += 1
  }

  return filled
}
