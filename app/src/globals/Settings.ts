import type { GlobalConfig } from 'payload'
import { isAdmin, isPublic } from '../access'

/**
 * Cấu hình toàn site. Khách chốt 30/08: mọi thông tin liên hệ phải sửa được
 * trong admin, không hardcode như site cũ (AUDIT §5.5).
 */
export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Cấu hình chung',
  admin: {
    group: 'Cấu hình',
    description:
      'Thông tin dùng chung cho toàn website: logo, hotline, địa chỉ, mạng xã hội. Chỉ Quản trị viên sửa được.',
  },
  // `read` public: mọi trang ngoài gọi getSettings() không kèm user — giữ nguyên.
  access: { read: isPublic, update: isAdmin },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Thương hiệu',
          fields: [
            {
              name: 'siteName',
              type: 'text',
              label: 'Tên website',
              defaultValue: 'Kế toán Hiacc',
              admin: { description: 'Hiện ở tiêu đề trình duyệt và kết quả Google.' },
            },
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
              label: 'Logo',
              admin: { description: 'Nên dùng file PNG nền trong suốt, cao tối thiểu 120 px.' },
            },
            {
              name: 'tagline',
              type: 'text',
              label: 'Slogan',
              localized: true,
              admin: { description: 'Câu ngắn dưới logo, ví dụ "Dịch vụ kế toán trọn gói".' },
            },
            {
              name: 'primaryColor',
              type: 'text',
              label: 'Màu chủ đạo',
              defaultValue: '#CC1420',
              admin: {
                description:
                  'Mã màu dạng #RRGGBB, mặc định #CC1420 — đỏ lấy đúng từ logo. Đổi màu này đổi toàn bộ nút và tiêu đề trên site, nên hỏi trước khi sửa.',
              },
            },
          ],
        },
        {
          label: 'Liên hệ',
          fields: [
            {
              name: 'hotline',
              type: 'text',
              label: 'Hotline',
              admin: { description: 'Số chính hiện trên thanh đầu trang. Bỏ trống thì tự ẩn.' },
            },
            { name: 'hotline2', type: 'text', label: 'Hotline 2', admin: { description: 'Số phụ, bỏ trống được.' } },
            { name: 'email', type: 'email', label: 'Email' },
            {
              name: 'headOfficeAddress',
              type: 'textarea',
              label: 'Địa chỉ trụ sở',
              localized: true,
              admin: { description: 'Địa chỉ hiện ở chân trang. Chi nhánh khác khai ở mục Chi nhánh.' },
            },
            { name: 'taxCode', type: 'text', label: 'Mã số thuế' },
            {
              name: 'companyName',
              type: 'text',
              label: 'Tên pháp nhân',
              localized: true,
              admin: { description: 'Tên đầy đủ trên giấy phép kinh doanh, dùng cho dòng bản quyền.' },
            },
          ],
        },
        {
          label: 'Mạng xã hội',
          fields: [
            {
              name: 'facebook',
              type: 'text',
              label: 'Facebook',
              admin: { description: 'Dán link đầy đủ, ví dụ https://facebook.com/hiacc. Bỏ trống thì ẩn icon.' },
            },
            { name: 'tiktok', type: 'text', label: 'TikTok', admin: { description: 'Dán link đầy đủ.' } },
            { name: 'youtube', type: 'text', label: 'YouTube', admin: { description: 'Dán link đầy đủ.' } },
            { name: 'twitter', type: 'text', label: 'Twitter (X)', admin: { description: 'Dán link đầy đủ.' } },
            {
              name: 'zaloQr',
              type: 'upload',
              relationTo: 'media',
              label: 'Mã QR Zalo',
              admin: { description: 'Ảnh mã QR để khách quét kết bạn Zalo. Ảnh vuông, nền trắng.' },
            },
          ],
        },
        {
          label: 'Footer',
          fields: [
            {
              name: 'aboutShort',
              type: 'textarea',
              label: 'Giới thiệu ngắn',
              localized: true,
              admin: { description: '2–3 câu về công ty, hiện ở cột đầu chân trang.' },
            },
            {
              name: 'copyright',
              type: 'text',
              label: 'Dòng bản quyền',
              localized: true,
              admin: { description: 'Ví dụ: © 2026 Công ty TNHH HiACC. Bảo lưu mọi quyền.' },
            },
          ],
        },
      ],
    },
  ],
}
