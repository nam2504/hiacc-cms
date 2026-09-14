import type { CollectionConfig } from 'payload'
import { contentAccess } from '../access'

/**
 * Bảng giá — nguồn DUY NHẤT quản lý giá dịch vụ (đổi 14/09, đảo lại hướng
 * 13/09 từng để giá nhúng trong `service-nodes.body` block `pricingTable`).
 *
 * Mỗi document = MỘT DÒNG giá (Hạng mục/Phạm vi/Phí), gắn với đúng NODE CON
 * cụ thể (vd "Kế toán trọn gói"), không phải nhóm gốc — một node có thể có
 * nhiều dòng giá (vd nhiều gói trong cùng hạng mục).
 *
 * Trang chi tiết dịch vụ filter theo `serviceNode = chính node đó` để hiện
 * đúng vị trí (xem block `pricingTable` trong `blocks.ts` — giờ chỉ còn
 * `title`/`note`, đóng vai placeholder đánh dấu điểm chèn trong body).
 * Trang /bang-gia gom theo `serviceNode.parent` (nhóm gốc) để ra 1 bảng/nhóm.
 *
 * ⚠️ Giá để dạng TEXT tự do (không phải number): nhiều gói dịch vụ báo giá
 * theo "Liên hệ" hoặc khoảng giá, không phải một con số cố định.
 */
export const PricingPlans: CollectionConfig = {
  slug: 'pricing-plans',
  admin: {
    useAsTitle: 'item',
    group: 'Nội dung',
    defaultColumns: ['item', 'serviceNode', 'fee', 'order'],
    description:
      'Nguồn giá duy nhất — mỗi dòng gắn với 1 hạng mục dịch vụ cụ thể. Hiện tự động ở trang chi tiết hạng mục đó và ở /bang-gia (gộp theo nhóm gốc).',
  },
  labels: { singular: 'Dòng giá', plural: 'Bảng giá' },
  access: contentAccess,
  defaultSort: 'order',
  fields: [
    {
      name: 'serviceNode',
      type: 'relationship',
      relationTo: 'service-nodes',
      label: 'Thuộc hạng mục dịch vụ',
      required: true,
      admin: {
        position: 'sidebar',
        description:
          'Hạng mục dịch vụ cụ thể (node con, vd "Kế toán trọn gói"), không phải nhóm gốc. Quyết định dòng giá hiện ở trang chi tiết hạng mục nào.',
      },
    },
    {
      name: 'item',
      type: 'text',
      label: 'Hạng mục',
      required: true,
      localized: true,
    },
    {
      name: 'scope',
      type: 'textarea',
      label: 'Phạm vi công việc',
      localized: true,
    },
    {
      name: 'fee',
      type: 'text',
      label: 'Phí dịch vụ',
      required: true,
      localized: true,
      admin: {
        description:
          'Ghi cả đơn vị, ví dụ "500.000 / tháng" hoặc "từ 3.000.000 / tháng". Đây là chữ, không phải số — để ghi được "liên hệ" hay "theo khối lượng".',
      },
    },
    {
      name: 'order',
      type: 'number',
      label: 'Thứ tự',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Số nhỏ hiện trước, trong cùng hạng mục.' },
    },
  ],
}
