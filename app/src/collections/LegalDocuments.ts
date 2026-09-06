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
    /**
     * `sourceUrl` và `order` vào danh sách vì cả hai đều là thứ chỉ nhìn bảng
     * mới phát hiện được sai: thiếu link thì dòng đó ra trang ngoài không bấm
     * được, còn `order` là cột đang quyết định thứ tự hiển thị (`defaultSort`)
     * mà trước đây không hiện ra ở đâu cả.
     * Bỏ `issuer` khỏi danh sách: nó dài, đẩy các cột sau tràn ngang, và vẫn
     * đọc được khi mở từng văn bản.
     */
    defaultColumns: ['title', 'code', 'group', 'effectiveYear', 'sourceUrl', 'order'],
    description:
      'Danh mục luật, nghị định, thông tư hiển thị ở trang Văn bản pháp luật. Mỗi dòng chỉ DẪN LINK tới nguồn chính thức — cố ý không đăng lại file, vì file đăng lại sẽ sai khi nguồn sửa mà không ai biết. Thứ tự trên trang: theo cột "Nhóm", trong mỗi nhóm theo "Thứ tự".',
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
      /**
       * ⚠️ `value` của 7 nhóm này đang được các bản ghi trong DB tham chiếu —
       * đổi hoặc xoá một `value` là mất nhóm của những văn bản đang dùng nó.
       * Sửa `label` thì an toàn. Thêm nhóm mới thì thêm vào cuối.
       */
      options: [...LEGAL_GROUPS],
      admin: {
        position: 'sidebar',
        description:
          'Quyết định văn bản nằm ở tab nào trên trang Văn bản pháp luật. Bắt buộc chọn — không có nhóm thì văn bản không hiện ở tab nào.',
      },
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
      /**
       * Nhãn cũ chỉ có "Hiệu lực" — nhân viên không đoán được là điền năm hay
       * điền ngày hay điền trạng thái. Nhãn mới nói thẳng đơn vị cần nhập.
       */
      label: 'Năm hiệu lực',
      admin: {
        description:
          'Năm văn bản có hiệu lực, ví dụ 2017. Ô này nhận cả chữ, nên ghi được "đã hết hiệu lực" hoặc "sửa đổi 2021" khi cần.',
      },
    },
    {
      name: 'sourceUrl',
      type: 'text',
      label: 'Link nguồn',
      admin: {
        description:
          'Địa chỉ đầy đủ tới văn bản trên trang của cơ quan ban hành, bắt đầu bằng https://. Đây là thứ người đọc bấm vào — bỏ trống thì dòng đó chỉ là chữ, không bấm được.',
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
