import type { CollectionConfig } from 'payload'
import { contentAccess } from '../access'

/**
 * Danh mục văn bản pháp luật — thiết kế khách 06/09 (`Văn bản pháp luật.png`).
 *
 * ⚠️ CHỦ Ý: KHÔNG có field upload file. Prototype của khách có cột "TẢI PDF",
 * nhưng khách yêu cầu rõ (chat 06/09) chỉ dẫn LINK ra nguồn, không cho tải văn
 * bản. Lý do thực tế: đăng lại file luật là tự nhận trách nhiệm về tính chính
 * xác và tính hiệu lực của bản đó — nguồn chính thức đổi thì bản trên site thành
 * sai mà không ai biết. Đừng thêm field upload vào đây.
 */
export const LEGAL_GROUPS = [
  { label: 'Kế toán', value: 'ke-toan' },
  { label: 'Thuế', value: 'thue' },
  { label: 'BHXH', value: 'bhxh' },
  { label: 'Lao động', value: 'lao-dong' },
  { label: 'Đăng ký kinh doanh', value: 'dang-ky-kinh-doanh' },
  { label: 'Đầu tư', value: 'dau-tu' },
  { label: 'Thương mại', value: 'thuong-mai' },
] as const

export const LegalDocuments: CollectionConfig = {
  slug: 'legal-documents',
  admin: {
    useAsTitle: 'title',
    group: 'Nội dung',
    defaultColumns: ['title', 'code', 'group', 'issuer', 'effectiveYear'],
    description:
      'Danh mục luật, nghị định, thông tư hiển thị ở trang Văn bản pháp luật. Chỉ dẫn link tới nguồn chính thức, không đăng lại file.',
  },
  labels: { singular: 'Văn bản pháp luật', plural: 'Văn bản pháp luật' },
  access: contentAccess,
  defaultSort: 'order',
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Tên văn bản',
      required: true,
      localized: true,
      admin: { description: 'Ví dụ: Luật Kế toán, Chế độ kế toán doanh nghiệp.' },
    },
    {
      name: 'code',
      type: 'text',
      label: 'Số hiệu',
      required: true,
      admin: { description: 'Ví dụ: 88/2015/QH13, 200/2014/TT-BTC.' },
    },
    {
      name: 'group',
      type: 'select',
      label: 'Nhóm',
      required: true,
      options: [...LEGAL_GROUPS],
      admin: { position: 'sidebar', description: 'Văn bản nằm ở tab nào trên trang.' },
    },
    {
      name: 'issuer',
      type: 'text',
      label: 'Cơ quan ban hành',
      localized: true,
      admin: { description: 'Ví dụ: Quốc hội, Bộ Tài chính, Chính phủ.' },
    },
    {
      name: 'effectiveYear',
      type: 'text',
      label: 'Hiệu lực',
      admin: {
        description:
          'Năm văn bản có hiệu lực, ví dụ 2017. Để chữ chứ không phải số để ghi được "đã hết hiệu lực" hay "sửa đổi 2021".',
      },
    },
    {
      name: 'sourceUrl',
      type: 'text',
      label: 'Link nguồn',
      admin: {
        description:
          'Địa chỉ đầy đủ tới văn bản trên trang của cơ quan ban hành (bắt đầu bằng https://). Bỏ trống thì dòng đó không có link.',
      },
    },
    {
      name: 'order',
      type: 'number',
      label: 'Thứ tự',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Số nhỏ hiện trước trong nhóm.' },
    },
  ],
}
