import type { CollectionConfig } from 'payload'
import { slugField, seoField } from './fields'
import { contentAccess } from '../access'

/** Trang tĩnh: Giới thiệu, Dịch vụ chuyên ngành, Liên hệ… */
export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    group: 'Nội dung',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    description: 'Các trang cố định của website: Giới thiệu, Liên hệ, Dịch vụ chuyên ngành…',
    preview: (doc) => (typeof doc?.slug === 'string' ? `/${doc.slug}` : null),
  },
  labels: { singular: 'Trang', plural: 'Trang' },
  versions: { drafts: true },
  access: contentAccess,
  fields: [
    { name: 'title', type: 'text', label: 'Tiêu đề trang', required: true, localized: true },
    slugField,
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Nội dung',
          description: 'Những gì hiện ra ngoài trang. Việc cần sửa hằng ngày nằm ở đây.',
          fields: [
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Ảnh đầu trang',
              admin: {
                description: 'Ảnh lớn hiển thị trên cùng. Nên ảnh ngang, tối thiểu 1600 px chiều rộng.',
              },
            },
            {
              name: 'content',
              type: 'richText',
              label: 'Nội dung',
              localized: true,
              admin: {
                description:
                  'Soạn thảo như Word. Bôi đen chữ để in đậm/đặt link. Dán từ Word nên dùng Ctrl+Shift+V để không mang theo định dạng lỗi.',
              },
            },
          ],
        },
        {
          label: 'SEO & nâng cao',
          description: 'Ít khi cần đụng — chỉ ảnh hưởng cách trang hiện trên Google/Facebook.',
          fields: [seoField],
        },
      ],
    },
  ],
}
