import type { CollectionConfig } from 'payload'
import { adminOnlyWriteAccess, isPublic } from '../access'

/**
 * 5 chi nhánh — AUDIT §3.6. Khách chốt: mọi thông tin liên hệ phải sửa được
 * trong admin, KHÔNG hardcode. Gồm cả email `info@diamondrise.com.vn`
 * đang dùng ở Bắc Ninh / Đà Nẵng / Nghệ An — khách tự sửa nếu sai.
 */
export const Branches: CollectionConfig = {
  slug: 'branches',
  admin: {
    useAsTitle: 'city',
    group: 'Cấu hình',
    defaultColumns: ['city', 'phone', 'email', 'order'],
    description:
      'Danh sách văn phòng hiển thị ở chân trang và trang Liên hệ. Chỉ Quản trị viên sửa được.',
  },
  labels: { singular: 'Chi nhánh', plural: 'Chi nhánh' },
  // `read` public: chân trang của site ngoài gọi getBranches() không kèm user.
  access: { read: isPublic, ...adminOnlyWriteAccess },
  fields: [
    { name: 'city', type: 'text', label: 'Thành phố', required: true, localized: true },
    {
      name: 'address',
      type: 'textarea',
      label: 'Địa chỉ',
      required: true,
      localized: true,
      admin: { description: 'Ghi đầy đủ số nhà, đường, phường/xã, quận/huyện, tỉnh/thành.' },
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Điện thoại',
      admin: { description: 'Ví dụ: 0243 123 4567. Bỏ trống thì chân trang tự ẩn dòng này.' },
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      admin: { description: 'Bỏ trống thì chân trang tự ẩn dòng này.' },
    },
    {
      name: 'mapUrl',
      type: 'text',
      label: 'Link Google Maps',
      admin: {
        description:
          'Mở Google Maps, tìm địa chỉ, bấm Chia sẻ → Sao chép liên kết rồi dán vào đây. Không phải mã nhúng <iframe>.',
      },
    },
    {
      name: 'order',
      type: 'number',
      label: 'Thứ tự',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Số nhỏ hiện trước. Trụ sở chính nên để 0.' },
    },
  ],
}
