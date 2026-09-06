import type { CollectionConfig } from 'payload'
import { slugField, seoField } from './fields'
import { contentAccess } from '../access'

/** Dịch vụ — AUDIT §3.5 (kế toán trọn gói, quyết toán thuế, hoàn thuế GTGT…). */
export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    useAsTitle: 'name',
    group: 'Nội dung',
    defaultColumns: ['name', 'order', 'slug', 'updatedAt'],
    description: 'Các dịch vụ công ty cung cấp, hiển thị ở trang chủ và menu Dịch vụ.',
    preview: (doc) => (typeof doc?.slug === 'string' ? `/dich-vu/${doc.slug}` : null),
  },
  labels: { singular: 'Dịch vụ', plural: 'Dịch vụ' },
  access: contentAccess,
  fields: [
    { name: 'name', type: 'text', label: 'Tên dịch vụ', required: true, localized: true },
    slugField,
    {
      name: 'icon',
      type: 'text',
      label: 'Icon',
      admin: {
        position: 'sidebar',
        description:
          'Chọn một khoá icon có sẵn: chart, folder, search, document, finance, archive, growth. Bỏ trống hoặc gõ sai tên sẽ tự dùng icon mặc định, không vỡ giao diện.',
      },
    },
    {
      name: 'order',
      type: 'number',
      label: 'Thứ tự',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Số nhỏ hiện trước.' },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Nội dung',
          description: 'Mô tả ngắn và nội dung chi tiết của dịch vụ. Việc cần sửa hằng ngày nằm ở đây.',
          fields: [
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              label: 'Ảnh dịch vụ',
              admin: {
                description:
                  'Ảnh minh hoạ hiện ở thẻ dịch vụ ngoài trang chủ và đầu trang chi tiết. Nên ảnh ngang tỉ lệ 3:2. Bỏ trống thì thẻ chỉ hiện icon như trước.',
              },
            },
            {
              name: 'summary',
              type: 'textarea',
              label: 'Mô tả ngắn',
              localized: true,
              admin: { description: '1–2 câu hiện ở thẻ dịch vụ ngoài trang chủ.' },
            },
            {
              name: 'content',
              type: 'richText',
              label: 'Nội dung chi tiết',
              localized: true,
              admin: { description: 'Nội dung đầy đủ của trang dịch vụ. Soạn thảo như Word.' },
            },
          ],
        },
        {
          label: 'SEO & nâng cao',
          description: 'Ít khi cần đụng — chỉ ảnh hưởng cách dịch vụ hiện trên Google/Facebook.',
          fields: [seoField],
        },
      ],
    },
  ],
}
