import type { CollectionConfig } from 'payload'
import { slugField, seoField } from './fields'
import { contentAccess } from '../access'

/**
 * Dịch vụ của CẤU TRÚC CŨ — đã bị "Cây dịch vụ" (service-nodes) thay thế.
 *
 * Vì sao còn trong repo: `seed/migrateServices.ts` đọc collection này để chuyển
 * nội dung khách đã nhập sang cây. Xoá bây giờ là mất đường lùi nếu phát hiện
 * mục nào chưa chuyển hết. Ẩn khỏi admin để khách không nhập nhầm vào chỗ không
 * còn hiển thị ra web — route /dich-vu đã gỡ.
 *
 * Xoá hẳn collection này là một việc riêng, làm khi đã xác nhận cây có đủ nội
 * dung của cả 7 mục.
 */
export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    useAsTitle: 'name',
    group: 'Nội dung',
    defaultColumns: ['name', 'order', 'slug', 'updatedAt'],
    description:
      'CẤU TRÚC CŨ, không còn hiển thị ra website. Nội dung đã chuyển sang "Cây dịch vụ" — sửa ở đó. Mục này giữ lại để đối chiếu, sẽ gỡ sau.',
    hidden: true,
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
