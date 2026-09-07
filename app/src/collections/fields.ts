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
/**
 * Chữ thường, số, nối bằng một dấu gạch ngang; không dấu tiếng Việt, không khoảng
 * trắng, không `/`.
 *
 * Vì sao phải chặn ở đây: không có validate thì Payload nhận mọi thứ, kể cả
 * "Kế Toán Thuế". Mục hiện lên menu như đã đăng thành công, nhưng khách bấm vào
 * nhận 404 — và admin không cảnh báo một chữ nào. Người nhập là nhân viên kế toán,
 * gõ tiếng Việt có dấu là phản xạ tự nhiên.
 */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const slugField: Field = {
  name: 'slug',
  type: 'text',
  label: 'Đường dẫn (slug)',
  required: true,
  unique: true,
  index: true,
  validate: (value: unknown) => {
    if (typeof value !== 'string' || value.length === 0) {
      return 'Cần nhập đường dẫn. Ví dụ: ke-toan-tron-goi'
    }
    if (!SLUG_PATTERN.test(value)) {
      return 'Đường dẫn chỉ được dùng chữ thường không dấu, số và dấu gạch ngang. Không dùng khoảng trắng, chữ hoa, dấu tiếng Việt hay dấu "/". Ví dụ đúng: ke-toan-tron-goi'
    }
    return true
  },
  admin: {
    position: 'sidebar',
    description:
      'Phần đuôi địa chỉ web, viết thường không dấu, nối bằng dấu gạch ngang. Ví dụ: gioi-thieu. ĐÃ ĐĂNG RỒI THÌ ĐỪNG ĐỔI — đổi là mọi link cũ hỏng và mất thứ hạng Google.',
  },
}
