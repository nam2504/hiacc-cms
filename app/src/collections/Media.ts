import type { CollectionConfig } from 'payload'
import { contentAccess } from '../access'

/**
 * Ảnh TỰ HOST. Site cũ để asset trên S3 bằng URL ký có hạn (Expires=...),
 * ảnh sẽ chết khi hết hạn — xem AUDIT §5.4. Không lặp lại cách đó.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Nội dung',
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'alt', 'mimeType', 'updatedAt'],
    description:
      'Kho ảnh và file PDF dùng chung cho cả website. Tải lên một lần rồi chọn lại ở bài viết, trang, dịch vụ.',
  },
  labels: { singular: 'Tệp ảnh', plural: 'Thư viện ảnh' },
  access: contentAccess,
  upload: {
    staticDir: 'public/media',
    mimeTypes: ['image/*', 'application/pdf'],
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 768, height: 512, position: 'centre' },
      { name: 'hero', width: 1920 },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Mô tả ảnh (alt)',
      localized: true,
      admin: {
        description:
          'Tả ngắn nội dung ảnh, ví dụ "Nhân viên HiACC tư vấn khách hàng". Quan trọng cho SEO và người khiếm thị đọc màn hình.',
      },
    },
  ],
}
