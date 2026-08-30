import type { CollectionConfig } from 'payload'
import { slugField, seoField } from './fields'
import { contentAccess } from '../access'

/** 13 chuyên mục lấy từ "Trung tâm kiến thức" của site cũ — AUDIT §3.8. */
export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    group: 'Nội dung',
    defaultColumns: ['name', 'group', 'order', 'slug'],
    description: 'Nhóm bài viết của Trung tâm kiến thức. Mỗi bài viết thuộc một chuyên mục.',
  },
  labels: { singular: 'Chuyên mục', plural: 'Chuyên mục' },
  access: contentAccess,
  fields: [
    { name: 'name', type: 'text', label: 'Tên chuyên mục', required: true, localized: true },
    slugField,
    {
      name: 'group',
      type: 'select',
      label: 'Nhóm',
      required: true,
      options: [
        { label: 'Kế toán & Doanh nghiệp', value: 'accounting' },
        { label: 'Pháp lý & Nhân sự', value: 'legal-hr' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Chuyên mục nằm ở cột nào trong menu Trung tâm kiến thức.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Mô tả ngắn',
      localized: true,
      admin: { description: 'Vài dòng giới thiệu hiện ở đầu trang chuyên mục.' },
    },
    {
      name: 'order',
      type: 'number',
      label: 'Thứ tự hiển thị',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Số nhỏ hiện trước. Để 0 hết thì sắp theo tên.' },
    },
    seoField,
  ],
}
