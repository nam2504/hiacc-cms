import type { GlobalConfig } from 'payload'
import { isAdmin, isPublic } from '../access'
import { TENANT } from '../config/tenant'

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
    /**
     * Nút "Làm mới cache website" — các trang public dùng ISR 10 phút nên nội
     * dung vừa sửa có thể chậm hiện; nút này xoá cache ngay.
     *
     * ⚠️ Đổi đường dẫn này thì PHẢI chạy lại `npm run generate:importmap`,
     * nếu không admin chết "Module not found".
     */
    components: {
      elements: {
        Description: '@/components/admin/RefreshCacheButton',
      },
    },
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
              // Không đặt defaultValue: bỏ trống = dùng tên của tenant
              // (src/config/tenant.ts). Đặt cứng ở đây sẽ ghim tên HiACC vào DB HiTax.
              admin: {
                description:
                  'Hiện ở tiêu đề trình duyệt và kết quả Google. Bỏ trống thì dùng tên mặc định của site.',
              },
            },
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
              label: 'Logo',
              admin: { description: 'Nên dùng file PNG nền trong suốt, cao tối thiểu 120 px.' },
            },
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Ảnh trang chủ',
              admin: {
                description:
                  'Ảnh lớn cạnh slogan ở đầu trang chủ. Nên dùng ảnh ngang (tỉ lệ 3:2), ' +
                  'rộng tối thiểu 1200 px. Để trống thì phần chữ tự giãn kín chiều ngang.',
              },
            },
            {
              name: 'tagline',
              type: 'text',
              label: 'Slogan',
              localized: true,
              admin: { description: 'Câu ngắn dưới logo, ví dụ "Dịch vụ kế toán trọn gói".' },
            },
            {
              name: 'businessField',
              type: 'text',
              label: 'Lĩnh vực hoạt động',
              localized: true,
              admin: {
                description:
                  'Hiện ở bảng "Hồ sơ công ty" trang Giới thiệu. Mặc định: Kế toán, thuế, thủ tục pháp lý doanh nghiệp.',
              },
            },
            {
              name: 'primaryColor',
              type: 'text',
              label: 'Màu chủ đạo',
              // Không đặt defaultValue: bỏ trống = dùng màu của tenant
              // (src/config/tenant.ts). Đặt cứng ở đây sẽ ghim màu HiACC vào DB HiTax.
              admin: {
                // Mã màu lấy từ TENANT, không viết cứng: cùng file này chạy cho
                // cả HiACC lẫn HiTax, viết cứng #CC1420 là mô tả sai màu ở site kia.
                description: `Bấm một ô trong bảng màu, hoặc gõ mã dạng #RRGGBB. Bỏ trống thì dùng màu mặc định của site (${TENANT.colors.brand.toUpperCase()}). Đổi màu này đổi toàn bộ nút và tiêu đề trên site, nên hỏi trước khi sửa.`,
                /**
                 * Ô text gốc được bọc thêm bảng màu bấm chọn — xem
                 * `components/admin/PrimaryColorField.tsx`. Vẫn ghi xuống DB
                 * đúng chuỗi `#RRGGBB` mà `lib/brandStyle.ts` đọc được, và vẫn
                 * cho gõ tay mã bất kỳ.
                 *
                 * ⚠️ Đổi đường dẫn này thì PHẢI chạy lại
                 * `npm run generate:importmap`, nếu không admin chết
                 * "Module not found".
                 */
                components: {
                  Field: {
                    path: '@/components/admin/PrimaryColorField',
                    // Component là 'use client' nên không đọc được process.env.TENANT.
                    // Truyền màu xuống từ đây (server) thay vì nướng cứng bằng
                    // NEXT_PUBLIC_* — biến đó bị thay bằng giá trị cố định lúc
                    // `next build`, một image chạy 2 tenant sẽ hiện màu của khách kia
                    // (xem src/lib/staging.ts).
                    clientProps: {
                      tenantBrand: TENANT.colors.brand.toUpperCase(),
                      tenantName: TENANT.name,
                    },
                  },
                },
              },
            },
            {
              name: 'footerTheme',
              type: 'select',
              label: 'Nền chân trang',
              defaultValue: 'light',
              options: [
                { label: 'Sáng — nền trắng, chữ đen (theo thiết kế)', value: 'light' },
                { label: 'Tối — nền đậm, chữ trắng', value: 'dark' },
              ],
              admin: {
                description:
                  'Chọn tông chân trang. "Sáng" là bản đúng thiết kế khách duyệt. Muốn màu nền khác hai lựa chọn này thì điền ô "Màu nền chân trang" bên dưới.',
              },
            },
            {
              name: 'footerBg',
              type: 'text',
              label: 'Màu nền chân trang',
              // Không đặt defaultValue: bỏ trống = dùng tông đã chọn ở "Nền chân trang".
              admin: {
                description:
                  'Không bắt buộc. Gõ mã dạng #RRGGBB để dùng màu nền riêng cho chân trang, ví dụ #1F4141. Bỏ trống thì theo lựa chọn "Nền chân trang" ở trên. Màu chữ tự đổi sáng/tối cho dễ đọc.',
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
            {
              name: 'workingHours',
              type: 'text',
              label: 'Giờ làm việc',
              localized: true,
              admin: {
                description:
                  'Hiện cạnh email ở trang Liên hệ. Ví dụ: 08:00 – 17:30, thứ Hai – thứ Sáu. Bỏ trống thì không hiện dòng này.',
              },
            },
            { name: 'taxCode', type: 'text', label: 'Mã số thuế' },
            {
              name: 'principles',
              type: 'array',
              label: 'Nguyên tắc hành nghề',
              labels: { singular: 'Nguyên tắc', plural: 'Nguyên tắc' },
              maxRows: 6,
              admin: {
                description:
                  'Hiện ở trang Giới thiệu, cột phải. Bỏ trống hết thì khối đó không hiện.',
              },
              fields: [
                { name: 'title', type: 'text', label: 'Tiêu đề', required: true, localized: true },
                {
                  name: 'description',
                  type: 'textarea',
                  label: 'Diễn giải',
                  required: true,
                  localized: true,
                },
              ],
            },
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
              admin: { description: 'Dán link đầy đủ, ví dụ https://facebook.com/tencongty. Bỏ trống thì ẩn icon.' },
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
          /**
           * Nội dung các khối trang chủ.
           *
           * Nguyên tắc: MỌI field ở tab này đều được phép bỏ trống. Trống thì
           * trang chủ dùng lại chuỗi mặc định trong `lib/i18n.ts` như trước —
           * nên bật thêm ngôn ngữ vẫn không cần sửa component, và khách xoá
           * nhầm một ô cũng không làm trang trắng.
           *
           * Vì vậy KHÔNG đặt `required: true` ở bất kỳ field nào bên dưới.
           *
           * Cũng KHÔNG đặt `initCollapsed` trên chính field `array`: hàng vừa bấm
           * "Add" sinh ra ở trạng thái gập và không mở lại được cho tới khi Save
           * rồi tải lại trang (P1-02). `initCollapsed` trên `collapsible` bao
           * ngoài thì vô hại — nó chỉ quyết định nhóm nào mở sẵn khi vào tab.
           */
          label: 'Trang chủ',
          description:
            'Bỏ trống ô nào thì trang chủ tự dùng nội dung mặc định của ô đó. Không ô nào bắt buộc.',
          fields: [
            {
              name: 'home',
              type: 'group',
              label: false,
              fields: [
                {
                  type: 'collapsible',
                  label: 'Khối đầu trang (Hero)',
                  admin: { initCollapsed: true },
                  fields: [
                    {
                      name: 'heroEyebrow',
                      type: 'text',
                      label: 'Dòng chữ nhỏ trên slogan',
                      localized: true,
                      admin: { description: 'Mặc định: Welcome to HiACC' },
                    },
                    {
                      name: 'heroLead',
                      type: 'textarea',
                      label: 'Đoạn mô tả',
                      localized: true,
                      admin: {
                        description:
                          'Đoạn văn dưới slogan. Mặc định: "Dịch vụ kế toán trọn gói…". Slogan sửa ở tab Thương hiệu.',
                      },
                    },
                    {
                      name: 'heroCta',
                      type: 'text',
                      label: 'Chữ trên nút chính',
                      localized: true,
                      admin: { description: 'Mặc định: Nhận tư vấn miễn phí' },
                    },
                    {
                      name: 'heroCtaSecondary',
                      type: 'text',
                      label: 'Chữ trên nút phụ',
                      localized: true,
                      admin: { description: 'Mặc định: Xem dịch vụ' },
                    },
                  ],
                },
                {
                  type: 'collapsible',
                  label: 'Dải cam kết (3 ô)',
                  admin: { initCollapsed: true },
                  fields: [
                    {
                      name: 'stats',
                      type: 'array',
                      label: 'Các ô cam kết',
                      localized: true,
                      maxRows: 4,
                      admin: {
                        description:
                          'Để trống cả mảng thì dùng 3 ô mặc định (Giảm thiểu / Nâng cao / Tối ưu). Thêm ô thứ 4 sẽ làm hàng bị lệch trên màn hình hẹp.',
                      },
                      fields: [
                        {
                          name: 'value',
                          type: 'text',
                          label: 'Dòng lớn',
                          admin: { description: 'Ví dụ: Giảm thiểu' },
                        },
                        {
                          name: 'label',
                          type: 'text',
                          label: 'Dòng mô tả',
                          admin: { description: 'Ví dụ: rủi ro về thuế và sổ sách' },
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'collapsible',
                  label: 'Khối giới thiệu (4 điểm tin cậy)',
                  admin: { initCollapsed: true },
                  fields: [
                    {
                      name: 'aboutTitle',
                      type: 'text',
                      label: 'Tiêu đề khối',
                      localized: true,
                      admin: { description: 'Bỏ trống thì dùng "Về " + tên site.' },
                    },
                    {
                      name: 'aboutPoints',
                      type: 'array',
                      label: '4 điểm tin cậy',
                      localized: true,
                      maxRows: 4,
                      admin: {
                        description:
                          'Để trống cả mảng thì dùng 4 điểm mặc định. Biểu tượng chọn theo danh sách có sẵn.',
                      },
                      fields: [
                        {
                          name: 'icon',
                          type: 'select',
                          label: 'Biểu tượng',
                          defaultValue: 'award',
                          options: [
                            { label: 'Chứng nhận', value: 'award' },
                            { label: 'Đào tạo', value: 'education' },
                            { label: 'Pháp lý', value: 'legal' },
                            { label: 'Điện thoại', value: 'phone' },
                          ],
                        },
                        { name: 'title', type: 'text', label: 'Tiêu đề' },
                        { name: 'body', type: 'textarea', label: 'Mô tả' },
                      ],
                    },
                  ],
                },
                {
                  type: 'collapsible',
                  label: 'Tiêu đề các khối còn lại',
                  admin: { initCollapsed: true },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'servicesTitle',
                          type: 'text',
                          label: 'Dịch vụ — tiêu đề',
                          localized: true,
                          admin: { width: '50%', description: 'Mặc định: Dịch vụ chuyên ngành' },
                        },
                        {
                          name: 'servicesSubtitle',
                          type: 'text',
                          label: 'Dịch vụ — mô tả',
                          localized: true,
                          admin: { width: '50%' },
                        },
                      ],
                    },
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'branchesTitle',
                          type: 'text',
                          label: 'Chi nhánh — tiêu đề',
                          localized: true,
                          admin: { width: '50%', description: 'Mặc định: Mạng lưới chi nhánh' },
                        },
                        {
                          name: 'branchesSubtitle',
                          type: 'text',
                          label: 'Chi nhánh — mô tả',
                          localized: true,
                          admin: { width: '50%' },
                        },
                      ],
                    },
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'knowledgeTitle',
                          type: 'text',
                          label: 'Kiến thức — tiêu đề',
                          localized: true,
                          admin: { width: '50%', description: 'Mặc định: Trung tâm kiến thức' },
                        },
                        {
                          name: 'knowledgeSubtitle',
                          type: 'text',
                          label: 'Kiến thức — mô tả',
                          localized: true,
                          admin: { width: '50%' },
                        },
                      ],
                    },
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'socialTitle',
                          type: 'text',
                          label: 'Mạng xã hội — tiêu đề',
                          localized: true,
                          admin: { width: '50%', description: 'Bỏ trống thì dùng "Kết nối với " + tên site.' },
                        },
                        {
                          name: 'socialSubtitle',
                          type: 'text',
                          label: 'Mạng xã hội — mô tả',
                          localized: true,
                          admin: { width: '50%' },
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'collapsible',
                  label: 'Khối kêu gọi cuối trang (CTA)',
                  admin: { initCollapsed: true },
                  fields: [
                    {
                      name: 'ctaTitle',
                      type: 'text',
                      label: 'Tiêu đề',
                      localized: true,
                      admin: { description: 'Mặc định: Cần tư vấn cho doanh nghiệp của bạn?' },
                    },
                    {
                      name: 'ctaSubtitle',
                      type: 'textarea',
                      label: 'Mô tả',
                      localized: true,
                      admin: {
                        description:
                          'Mặc định có nhắc "gọi trực tiếp" — nếu chưa điền Hotline ở tab Liên hệ thì nên sửa lại câu này cho khớp.',
                      },
                    },
                    {
                      name: 'ctaButton',
                      type: 'text',
                      label: 'Chữ trên nút',
                      localized: true,
                      admin: { description: 'Mặc định: Nhận tư vấn miễn phí' },
                    },
                  ],
                },
              ],
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
              admin: { description: 'Ví dụ: © 2026 Công ty TNHH ABC. Bảo lưu mọi quyền.' },
            },
            {
              name: 'footerHeadings',
              type: 'group',
              label: 'Tiêu đề các cột',
              admin: {
                description: 'Bỏ trống thì dùng tiêu đề mặc định của cột đó.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'about',
                      type: 'text',
                      label: 'Cột giới thiệu',
                      localized: true,
                      admin: { width: '50%', description: 'Mặc định: Về chúng tôi' },
                    },
                    {
                      name: 'headOffice',
                      type: 'text',
                      label: 'Cột trụ sở',
                      localized: true,
                      admin: { width: '50%', description: 'Mặc định: Trụ sở' },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'contact',
                      type: 'text',
                      label: 'Cột liên hệ',
                      localized: true,
                      admin: { width: '50%', description: 'Mặc định: Liên hệ' },
                    },
                  ],
                },
                {
                  name: 'followUs',
                  type: 'text',
                  label: 'Cột kênh liên kết',
                  localized: true,
                  admin: { description: 'Mặc định: Kênh của HiACC' },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
