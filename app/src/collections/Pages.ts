import type { CollectionConfig } from 'payload'
import { slugField, seoField } from './fields'
import { contentAccess } from '../access'

/**
 * Nội dung của BA trang cố định đã có sẵn route: `/gioi-thieu`, `/dich-vu`,
 * `/lien-he`. Đây là chỗ sửa chữ và ảnh của ba trang đó, KHÔNG phải chỗ tạo
 * trang mới.
 *
 * Vì sao chặn tạo mới: trang chỉ hiện ra khi có route trong code đọc đúng slug
 * của nó. Bản ghi mới với slug lạ sẽ lưu được nhưng mở ngoài web là 404 — người
 * nhập tưởng mình đã đăng trang, thực tế không ai xem được. Cần thêm trang mới
 * thì thêm route trong code, hoặc dùng "Cây dịch vụ" (tự sinh đường dẫn).
 */
export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    group: 'Nội dung',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    description:
      'Nội dung ba trang cố định: Giới thiệu, Dịch vụ chuyên ngành, Liên hệ. Sửa chữ và ảnh ở đây. Không tạo được trang mới ở đây — trang mới cần route trong code; muốn thêm trang dịch vụ thì dùng "Cây dịch vụ".',
    preview: (doc) => (typeof doc?.slug === 'string' ? `/${doc.slug}` : null),
  },
  labels: { singular: 'Trang', plural: 'Trang' },
  versions: { drafts: true },
  /**
   * Không cho tạo mới: xem lý do ở đầu file. Sửa và đọc vẫn theo quyền chung,
   * xoá vẫn để admin — xoá một trong ba trang là làm trang đó trống, nên chỉ
   * admin được làm.
   */
  access: { ...contentAccess, create: () => false },
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
