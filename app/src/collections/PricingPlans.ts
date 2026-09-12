import type { CollectionConfig } from 'payload'
import { contentAccess } from '../access'

/**
 * Bảng giá — khách feedback 12/09: /bang-gia đang là trang giữ chỗ
 * (`EmptyState`), chưa có nơi nào trong admin để tự set nội dung.
 *
 * Mỗi gói giá gắn với MỘT nhóm dịch vụ cấp cao nhất (`service-nodes` có
 * `parent` rỗng) — khách chọn "Theo nhóm dịch vụ" thay vì một bảng giá chung,
 * để mỗi nhóm (kế toán, thuế, BHXH...) có bảng giá riêng.
 *
 * ⚠️ Giá để dạng TEXT tự do (không phải number): nhiều gói dịch vụ kế toán
 * báo giá theo "Liên hệ" hoặc khoảng giá, không phải một con số cố định.
 */
export const PricingPlans: CollectionConfig = {
  slug: 'pricing-plans',
  admin: {
    useAsTitle: 'name',
    group: 'Nội dung',
    defaultColumns: ['name', 'serviceGroup', 'price', 'featured', 'order'],
    description:
      'Các gói giá hiện ở trang Bảng giá, nhóm theo dịch vụ. Thứ tự hiển thị: theo "Thuộc nhóm dịch vụ", trong nhóm theo "Thứ tự".',
  },
  labels: { singular: 'Gói giá', plural: 'Bảng giá' },
  access: contentAccess,
  defaultSort: 'order',
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Tên gói',
      required: true,
      localized: true,
      admin: { description: 'Ví dụ: Kế toán trọn gói, Gói cơ bản.' },
    },
    {
      name: 'serviceGroup',
      type: 'relationship',
      relationTo: 'service-nodes',
      label: 'Thuộc nhóm dịch vụ',
      required: true,
      /**
       * Chỉ cho chọn node CẤP CAO NHẤT (`parent` rỗng) — trang /bang-gia chỉ
       * duyệt qua các nhóm gốc (`getServiceTree()`). Chọn nhầm một hạng mục
       * con sẽ khiến gói giá biến mất khỏi trang mà không có cảnh báo nào,
       * vì không khớp id nhóm gốc nào cả.
       */
      filterOptions: { parent: { exists: false } },
      admin: {
        position: 'sidebar',
        description:
          'Nhóm dịch vụ cấp cao nhất mà gói này thuộc về (kế toán, thuế, BHXH...). Quyết định gói hiện ở bảng giá của nhóm nào. Chỉ hiện các nhóm gốc, không hiện hạng mục con.',
      },
    },
    {
      name: 'price',
      type: 'text',
      label: 'Giá hiển thị',
      required: true,
      localized: true,
      admin: {
        description:
          'Chữ hiển thị cho giá, không bắt buộc là số — ví dụ "1.500.000đ/tháng", "Liên hệ báo giá".',
      },
    },
    {
      name: 'summary',
      type: 'textarea',
      label: 'Mô tả ngắn',
      localized: true,
      admin: { description: 'Một câu ngắn dưới tên gói, giải thích gói này dành cho ai.' },
    },
    {
      name: 'features',
      type: 'array',
      label: 'Tính năng / hạng mục bao gồm',
      labels: { singular: 'Mục', plural: 'Mục' },
      admin: { description: 'Danh sách gạch đầu dòng hiện trong thẻ gói giá.' },
      fields: [{ name: 'text', type: 'text', label: 'Nội dung', required: true, localized: true }],
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Nổi bật',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Bật để gói này hiện nổi bật (viền/nền khác) trong bảng giá của nhóm.',
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
