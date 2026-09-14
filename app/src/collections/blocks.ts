import type { Block } from 'payload'

/**
 * Các khối nội dung lắp ghép cho trang dịch vụ (`service-nodes.body`).
 *
 * Vì sao dùng blocks thay vì field cố định: requirement 06/09 cho thấy cấu trúc
 * mỗi hạng mục KHÁC NHAU thật, không ép được một khuôn:
 *   - Kế toán trọn gói : Bảng giá → Nhiệm vụ HIACC → Nhiệm vụ KH → Cam kết
 *   - Kế toán nội bộ   : thêm "Phạm vi trọn gói" và các phần hành (lương, bán
 *                        hàng, kho, công nợ) — không có ở hạng mục nào khác
 *   - Thay đổi ĐKKD    : 5 trường chuẩn hoá (Yêu cầu chung / Thực hiện / Thời
 *                        gian / Trả kết quả / Phí) cho cả 9 hạng mục
 *   - Thành lập        : mỗi hạng mục kèm một khối kiến thức riêng
 * Ép khuôn cố định thì hai nhóm đầu sẽ phải nhét chữ vào ô sai nghĩa.
 *
 * Người nhập tự chọn khối cần dùng và kéo đổi thứ tự trong /admin.
 */

/**
 * Bảng giá: PLACEHOLDER đánh dấu vị trí chèn trong `body` (đổi 14/09 — dữ liệu
 * dòng giá không còn nằm ở đây nữa, chuyển hết sang collection `pricing-plans`
 * để đó là nguồn duy nhất quản lý giá; xem `PricingPlans.ts`). Khối này chỉ
 * còn quyết định TIÊU ĐỀ/GHI CHÚ và VỊ TRÍ hiện bảng giá của chính node đang
 * xem, giữa các block khác — kéo-thả trong admin vẫn đổi được vị trí đó.
 * Không xoá hẳn khối để giữ chỗ chèn: xoá khối này khỏi body = ẩn bảng giá
 * khỏi trang, dù `pricing-plans` của node đó vẫn còn dữ liệu.
 */
export const pricingTableBlock: Block = {
  slug: 'pricingTable',
  labels: { singular: 'Bảng giá dịch vụ (vị trí)', plural: 'Bảng giá dịch vụ (vị trí)' },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Tiêu đề khối',
      localized: true,
      admin: { description: 'Bỏ trống thì hiện "Bảng giá dịch vụ".' },
    },
    {
      name: 'note',
      type: 'textarea',
      label: 'Ghi chú dưới bảng',
      localized: true,
      admin: { description: 'Ví dụ: phí chưa gồm lệ phí nhà nước.' },
    },
  ],
}

/** Danh sách gạch đầu dòng — Nhiệm vụ HIACC / Nhiệm vụ khách hàng / Cam kết. */
export const bulletListBlock: Block = {
  slug: 'bulletList',
  labels: { singular: 'Danh sách gạch đầu dòng', plural: 'Danh sách gạch đầu dòng' },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Tiêu đề khối',
      required: true,
      localized: true,
      admin: { description: 'Ví dụ: Nhiệm vụ của công ty, Nhiệm vụ của khách hàng, Cam kết.' },
    },
    {
      name: 'items',
      type: 'array',
      label: 'Các dòng',
      labels: { singular: 'Dòng', plural: 'Dòng' },
      minRows: 1,
      fields: [{ name: 'text', type: 'textarea', label: 'Nội dung', required: true, localized: true }],
    },
  ],
}

/**
 * Bảng "nhãn — nội dung" cho nhóm Thay đổi ĐKKD: Yêu cầu chung / Thực hiện /
 * Thời gian / Trả kết quả / Phí dịch vụ. Nhãn để người nhập tự đặt, vì các nhóm
 * khác cũng dùng dạng này với tên trường khác.
 */
export const fieldTableBlock: Block = {
  slug: 'fieldTable',
  labels: { singular: 'Bảng thông tin theo mục', plural: 'Bảng thông tin theo mục' },
  fields: [
    { name: 'title', type: 'text', label: 'Tiêu đề khối', localized: true },
    {
      name: 'rows',
      type: 'array',
      label: 'Các mục',
      labels: { singular: 'Mục', plural: 'Mục' },
      minRows: 1,
      fields: [
        {
          name: 'label',
          type: 'text',
          label: 'Tên mục',
          required: true,
          localized: true,
          admin: { description: 'Ví dụ: Yêu cầu chung, Thực hiện, Thời gian, Trả kết quả.' },
        },
        { name: 'value', type: 'textarea', label: 'Nội dung', required: true, localized: true },
      ],
    },
  ],
}

/** Đoạn văn tự do — dùng cho khối kiến thức riêng của từng nhóm. */
export const richTextBlock: Block = {
  slug: 'richTextBlock',
  labels: { singular: 'Đoạn nội dung', plural: 'Đoạn nội dung' },
  fields: [
    { name: 'title', type: 'text', label: 'Tiêu đề khối', localized: true },
    { name: 'content', type: 'richText', label: 'Nội dung', localized: true },
  ],
}

/** Nút kêu gọi hành động đặt giữa nội dung. */
export const ctaBlock: Block = {
  slug: 'ctaBlock',
  labels: { singular: 'Nút kêu gọi', plural: 'Nút kêu gọi' },
  fields: [
    { name: 'label', type: 'text', label: 'Chữ trên nút', required: true, localized: true },
    {
      name: 'href',
      type: 'text',
      label: 'Đường dẫn',
      required: true,
      admin: { description: 'Ví dụ: /lien-he — hoặc địa chỉ đầy đủ nếu trỏ ra ngoài.' },
    },
  ],
}

export const serviceBodyBlocks = [
  pricingTableBlock,
  bulletListBlock,
  fieldTableBlock,
  richTextBlock,
  ctaBlock,
]
