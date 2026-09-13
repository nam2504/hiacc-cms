import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'
import { slugField, seoField } from './fields'
import { contentAccess } from '../access'

/**
 * Nội dung của HAI trang cố định đã có sẵn route: `/gioi-thieu` và `/lien-he`.
 * Đây là chỗ sửa chữ và ảnh của hai trang đó, KHÔNG phải chỗ tạo trang mới.
 *
 * Đúng hai bản ghi, và đó là toàn bộ chỗ tiêu thụ collection này:
 *   src/app/(site)/gioi-thieu/page.tsx → getPageBySlug('gioi-thieu')
 *   src/app/(site)/lien-he/page.tsx    → getPageBySlug('lien-he')
 * (`getPageBySlug` ở `src/lib/site.ts`.)
 *
 * ⚠️ Comment cũ ở đây ghi BA trang, kể thêm `/dich-vu`. Sai: route `/dich-vu`
 * không tồn tại và trong DB cũng không có bản ghi nào slug đó. Trang dịch vụ
 * nay do collection "Cây dịch vụ" (`service-nodes`) sinh ra qua route catch-all.
 * Đừng đưa `/dich-vu` trở lại danh sách này.
 *
 * Vì sao chặn tạo mới: trang chỉ hiện ra khi có route trong code đọc đúng slug
 * của nó. Bản ghi mới với slug lạ sẽ lưu được nhưng mở ngoài web là 404 — người
 * nhập tưởng mình đã đăng trang, thực tế không ai xem được. Cần thêm trang mới
 * thì dev thêm route trong code trước; muốn thêm trang dịch vụ thì dùng "Cây
 * dịch vụ" (tự sinh đường dẫn, không cần dev).
 *
 * Collection này KHÔNG phải code cũ — có người từng nghi vậy. Xoá nó là làm
 * trắng nội dung hai trang Giới thiệu và Liên hệ đang chạy ngoài production.
 */
export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    group: 'Nội dung',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    description:
      'Chỗ sửa chữ và ảnh của ĐÚNG HAI trang: Giới thiệu và Liên hệ. Đây không phải nơi tạo trang mới — cố ý không có nút "Create new", vì một trang chỉ hiện ra ngoài web khi lập trình viên đã làm sẵn đường dẫn cho nó; bản ghi tự thêm sẽ lưu được nhưng mở ra là lỗi 404. Cần thêm trang dịch vụ thì dùng "Cây dịch vụ" (tự sinh đường dẫn). Cần một trang khác hẳn thì báo lập trình viên.',
    preview: (doc) => (typeof doc?.slug === 'string' ? `/${doc.slug}` : null),
  },
  // Đổi tên hiển thị từ "Trang" → "Trang tĩnh" (13/09, Nam báo khó phân biệt với
  // "Cây dịch vụ" trong sidebar) — chỉ đổi label, slug/API/route giữ nguyên.
  labels: { singular: 'Trang tĩnh', plural: 'Trang tĩnh' },
  versions: { drafts: true },
  /**
   * Không cho tạo mới: xem lý do ở đầu file. Sửa và đọc vẫn theo quyền chung,
   * xoá vẫn để admin — xoá một trong hai trang là làm trang đó trống ngoài
   * production, nên chỉ admin được làm.
   */
  /**
   * Chặn cả tạo lẫn xoá. Hai thao tác này phải đối xứng: `create: false` có từ
   * trước vì bản ghi mới lưu được nhưng site 404 (route là file tĩnh). Nếu chỉ
   * chặn tạo mà vẫn cho xoá thì admin xoá `/gioi-thieu` là mất VĨNH VIỄN qua giao
   * diện — không có đường nào trong /admin tạo lại, phải gọi lập trình viên.
   *
   * Đúng hai bản ghi, buộc với hai route tĩnh. Cần sửa nội dung thì sửa tại chỗ.
   */
  access: { ...contentAccess, create: () => false, delete: () => false },
  hooks: {
    /**
     * `access.delete` KHÔNG đủ: Local API mặc định `overrideAccess: true` nên mọi
     * script chạy bằng `payload run` xoá được như thường. Hook thì luôn chạy.
     *
     * Đối xứng với `create: false`: hai bản ghi này buộc với hai route file tĩnh
     * (`/gioi-thieu`, `/lien-he`). Xoá là site 404 và KHÔNG có đường nào trong
     * /admin tạo lại — phải gọi lập trình viên.
     */
    beforeDelete: [
      () => {
        throw new APIError(
          'Không xoá được trang này: nội dung của nó gắn với một địa chỉ cố định của website (/gioi-thieu, /lien-he). Xoá là trang ngoài site báo lỗi 404 và không có cách nào tạo lại trong trang quản trị. Cần sửa nội dung thì sửa trực tiếp tại đây.',
          400,
        )
      },
    ],
  },
  // Bỏ bọc `type: 'tabs'` (13/09, Nam báo phải bấm chọn tab mới thấy field, bất
  // tiện khi sửa) — để phẳng, form edit hiện hết field một lần, cuộn xuống là thấy.
  fields: [
    { name: 'title', type: 'text', label: 'Tiêu đề trang', required: true, localized: true },
    slugField,
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
    seoField,
  ],
}
