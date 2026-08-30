import type { Field } from 'payload'

/** Nhóm field SEO dùng chung — site cũ gần như không có SEO, xem AUDIT §5.2/5.3. */
export const seoField: Field = {
  name: 'seo',
  type: 'group',
  label: 'SEO',
  admin: {
    description:
      'Phần hiển thị trên Google và khi chia sẻ lên Facebook/Zalo. Bỏ trống thì hệ thống tự lấy tiêu đề và mô tả ngắn của bài.',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Tiêu đề SEO',
      localized: true,
      admin: { description: 'Dòng chữ xanh trên Google. Nên 50–60 ký tự, có tên dịch vụ chính.' },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Mô tả SEO',
      localized: true,
      admin: { description: 'Đoạn mô tả dưới tiêu đề trên Google. Nên 120–160 ký tự.' },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Ảnh chia sẻ (OG)',
      admin: { description: 'Ảnh hiện khi dán link lên Facebook/Zalo. Nên 1200×630 px.' },
    },
  ],
}

/** Slug: nhập tay để giữ URL ổn định (đổi slug = mất thứ hạng Google). */
export const slugField: Field = {
  name: 'slug',
  type: 'text',
  label: 'Đường dẫn (slug)',
  required: true,
  unique: true,
  index: true,
  admin: {
    position: 'sidebar',
    description:
      'Phần đuôi địa chỉ web, viết thường không dấu, nối bằng dấu gạch ngang. Ví dụ: gioi-thieu. ĐÃ ĐĂNG RỒI THÌ ĐỪNG ĐỔI — đổi là mọi link cũ hỏng và mất thứ hạng Google.',
  },
}
