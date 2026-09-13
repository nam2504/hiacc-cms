import type { Payload } from 'payload'
import type { LegalDocument } from '@/payload-types'

/**
 * Seed danh mục văn bản pháp luật.
 *
 * Bốn văn bản nhóm Kế toán lấy đúng số hiệu và tên từ ảnh thiết kế khách gửi
 * (`Văn bản pháp luật.png`). 19 văn bản còn lại (6 nhóm: Thuế, BHXH, Lao động,
 * ĐKKD, Đầu tư, Thương mại) lấy từ biểu mẫu demo khách duyệt
 * (`hitax/hiacc-website-demo.html`, biến `LEGAL`) — cùng nguồn đã dùng để điền
 * bảng giá 13/09.
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
  {
    code: '38/2019/QH14',
    title: 'Luật Quản lý thuế',
    issuer: 'Quốc hội',
    effectiveYear: '2020',
    group: 'thue',
  },
  {
    code: '126/2020/NĐ-CP',
    title: 'Hướng dẫn Luật Quản lý thuế',
    issuer: 'Chính phủ',
    effectiveYear: '2020',
    group: 'thue',
  },
  {
    code: '80/2021/TT-BTC',
    title: 'Hướng dẫn quản lý thuế và kê khai',
    issuer: 'Bộ Tài chính',
    effectiveYear: '2022',
    group: 'thue',
  },
  {
    code: '123/2020/NĐ-CP',
    title: 'Hoá đơn, chứng từ',
    issuer: 'Chính phủ',
    effectiveYear: '2022',
    group: 'thue',
  },
  {
    code: '41/2024/QH15',
    title: 'Luật Bảo hiểm xã hội',
    issuer: 'Quốc hội',
    effectiveYear: '2025',
    group: 'bhxh',
  },
  {
    code: '595/QĐ-BHXH',
    title: 'Quy trình thu BHXH, BHYT, BHTN',
    issuer: 'BHXH Việt Nam',
    effectiveYear: '2017',
    group: 'bhxh',
  },
  {
    code: '58/2020/QH14',
    title: 'Luật Người lao động Việt Nam đi làm việc ở nước ngoài',
    issuer: 'Quốc hội',
    effectiveYear: '2022',
    group: 'bhxh',
  },
  {
    code: '45/2019/QH14',
    title: 'Bộ luật Lao động',
    issuer: 'Quốc hội',
    effectiveYear: '2021',
    group: 'lao-dong',
  },
  {
    code: '145/2020/NĐ-CP',
    title: 'Điều kiện lao động và quan hệ lao động',
    issuer: 'Chính phủ',
    effectiveYear: '2021',
    group: 'lao-dong',
  },
  {
    code: '152/2020/NĐ-CP',
    title: 'Lao động nước ngoài làm việc tại Việt Nam',
    issuer: 'Chính phủ',
    effectiveYear: '2021',
    group: 'lao-dong',
  },
  {
    code: '59/2020/QH14',
    title: 'Luật Doanh nghiệp',
    issuer: 'Quốc hội',
    effectiveYear: '2021',
    group: 'dang-ky-kinh-doanh',
  },
  {
    code: '01/2021/NĐ-CP',
    title: 'Đăng ký doanh nghiệp',
    issuer: 'Chính phủ',
    effectiveYear: '2021',
    group: 'dang-ky-kinh-doanh',
  },
  {
    code: '01/2021/TT-BKHĐT',
    title: 'Biểu mẫu đăng ký doanh nghiệp',
    issuer: 'Bộ KH&ĐT',
    effectiveYear: '2021',
    group: 'dang-ky-kinh-doanh',
  },
  {
    code: '61/2020/QH14',
    title: 'Luật Đầu tư',
    issuer: 'Quốc hội',
    effectiveYear: '2021',
    group: 'dau-tu',
  },
  {
    code: '31/2021/NĐ-CP',
    title: 'Hướng dẫn Luật Đầu tư',
    issuer: 'Chính phủ',
    effectiveYear: '2021',
    group: 'dau-tu',
  },
  {
    code: '03/2021/TT-BKHĐT',
    title: 'Biểu mẫu thủ tục đầu tư',
    issuer: 'Bộ KH&ĐT',
    effectiveYear: '2021',
    group: 'dau-tu',
  },
  {
    code: '36/2005/QH11',
    title: 'Luật Thương mại',
    issuer: 'Quốc hội',
    effectiveYear: '2006',
    group: 'thuong-mai',
  },
  {
    code: '09/2018/NĐ-CP',
    title: 'Hoạt động mua bán hàng hoá của nhà đầu tư nước ngoài',
    issuer: 'Chính phủ',
    effectiveYear: '2018',
    group: 'thuong-mai',
  },
  {
    code: '52/2013/NĐ-CP',
    title: 'Thương mại điện tử',
    issuer: 'Chính phủ',
    effectiveYear: '2013',
    group: 'thuong-mai',
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
