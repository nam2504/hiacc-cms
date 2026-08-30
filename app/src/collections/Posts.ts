import type { CollectionConfig } from 'payload'
import { slugField, seoField } from './fields'
import { contentAccess } from '../access'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    group: 'Nội dung',
    defaultColumns: ['title', 'category', 'publishedAt', '_status'],
    description: 'Bài viết của Trung tâm kiến thức. Lưu nháp để viết dở, bấm Xuất bản khi đăng.',
    preview: (doc) => (typeof doc?.slug === 'string' ? `/tin-tuc/${doc.slug}` : null),
  },
  labels: { singular: 'Bài viết', plural: 'Bài viết' },
  versions: { drafts: true },
  access: contentAccess,
  fields: [
    { name: 'title', type: 'text', label: 'Tiêu đề', required: true, localized: true },
    slugField,
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Ngày đăng',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
        description: 'Ngày hiển thị trên bài và dùng để sắp xếp. Bỏ trống thì bài xếp cuối danh sách.',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      label: 'Chuyên mục',
      required: true,
      admin: { position: 'sidebar', description: 'Mỗi bài thuộc đúng một chuyên mục.' },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Nội dung',
          description: 'Ảnh bìa, tóm tắt và bài viết. Việc cần sửa hằng ngày nằm ở đây.',
          fields: [
            {
              name: 'cover',
              type: 'upload',
              relationTo: 'media',
              label: 'Ảnh bìa',
              admin: { description: 'Ảnh đại diện trong danh sách bài. Nên ảnh ngang tỉ lệ 3:2.' },
            },
            {
              name: 'excerpt',
              type: 'textarea',
              label: 'Tóm tắt',
              localized: true,
              admin: { description: 'Vài dòng giới thiệu hiện ở danh sách bài viết. Nên 1–2 câu.' },
            },
            {
              name: 'content',
              type: 'richText',
              label: 'Nội dung',
              localized: true,
              admin: {
                description:
                  'Soạn thảo như Word. Dán từ Word nên dùng Ctrl+Shift+V. Chèn ảnh bằng nút trên thanh công cụ, ảnh sẽ vào Thư viện ảnh.',
              },
            },
          ],
        },
        {
          label: 'SEO & nâng cao',
          description: 'Ít khi cần đụng — chỉ ảnh hưởng cách bài hiện trên Google/Facebook.',
          fields: [seoField],
        },
      ],
    },
  ],
}
