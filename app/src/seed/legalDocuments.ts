import type { Payload } from 'payload'
import type { LegalDocument } from '@/payload-types'

/**
 * Seed danh mục văn bản pháp luật.
 *
 * Bốn văn bản nhóm Kế toán lấy đúng số hiệu và tên từ ảnh thiết kế khách gửi
 * (`Văn bản pháp luật.png`). Chú thích trong chính ảnh đó ghi: "Danh mục rút gọn
 * phục vụ dựng giao diện; bổ sung link tải và tình trạng hiệu lực khi vận hành".
 *
 * ⚠️ `sourceUrl` để TRỐNG. Không tự đi tìm link trên mạng rồi điền vào: link sai
 * hoặc trỏ tới bản đã hết hiệu lực trên trang một công ty kế toán thì tệ hơn là
 * chưa có link. Khách hoặc người vận hành điền trong /admin.
 *
 * Idempotent: tra theo số hiệu, đã có thì bỏ qua.
 */

/** Lấy kiểu `group` thẳng từ collection: thêm nhóm mới mà quên seed thì tsc báo. */
type LegalSeed = {
  code: string
  title: string
  issuer: string
  effectiveYear: string
  group: LegalDocument['group']
}

const LEGAL_DOCUMENTS: LegalSeed[] = [
  {
    code: '88/2015/QH13',
    title: 'Luật Kế toán',
    issuer: 'Quốc hội',
    effectiveYear: '2017',
    group: 'ke-toan',
  },
  {
    code: '200/2014/TT-BTC',
    title: 'Chế độ kế toán doanh nghiệp',
    issuer: 'Bộ Tài chính',
    effectiveYear: '2015',
    group: 'ke-toan',
  },
  {
    code: '133/2016/TT-BTC',
    title: 'Chế độ kế toán doanh nghiệp nhỏ và vừa',
    issuer: 'Bộ Tài chính',
    effectiveYear: '2017',
    group: 'ke-toan',
  },
  {
    code: '174/2016/NĐ-CP',
    title: 'Hướng dẫn thi hành Luật Kế toán',
    issuer: 'Chính phủ',
    effectiveYear: '2017',
    group: 'ke-toan',
  },
]

export async function seedLegalDocuments(payload: Payload): Promise<void> {
  let created = 0
  let skipped = 0

  for (const [index, item] of LEGAL_DOCUMENTS.entries()) {
    const existing = await payload.find({
      collection: 'legal-documents',
      where: { code: { equals: item.code } },
      limit: 1,
      depth: 0,
    })

    if (existing.docs.length > 0) {
      skipped += 1
      continue
    }

    await payload.create({
      collection: 'legal-documents',
      data: { ...item, order: (index + 1) * 10 },
    })
    created += 1
  }

  console.log(`[seed] văn bản pháp luật: tạo mới ${created}, bỏ qua ${skipped} (đã có).`)
}
