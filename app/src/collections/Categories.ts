import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'
import { slugField, seoField } from './fields'
import { contentAccess } from '../access'

/** 13 chuyên mục lấy từ "Trung tâm kiến thức" của site cũ — AUDIT §3.8. */
export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    group: 'Nội dung',
    defaultColumns: ['name', 'group', 'order', 'slug'],
    description:
      'Chuyên mục của Trung tâm kiến thức — mỗi bài viết thuộc một chuyên mục. Xoá một chuyên mục sẽ làm các bài viết đang thuộc nó mất chuyên mục, nên sửa tên thay vì xoá rồi tạo lại.',
  },
  labels: { singular: 'Chuyên mục', plural: 'Chuyên mục' },
  access: contentAccess,
  hooks: {
    /**
     * Chặn xoá chuyên mục còn bài viết.
     *
     * Không chặn thì `posts.category` (khai `required: true`) thành NULL trên bài
     * ĐÃ XUẤT BẢN: bài vẫn hiện ngoài site nhưng không lưu lại được nữa — biên tập
     * viên mở ra sửa thì Payload báo "The following field is invalid: Chuyên mục"
     * mà không chỉ ra bài nào đã hỏng.
     */
    beforeDelete: [
      async ({ id, req }) => {
        const posts = await req.payload.find({
          collection: 'posts',
          where: { category: { equals: id } },
          limit: 0,
          depth: 0,
          req,
        })

        if (posts.totalDocs > 0) {
          throw new APIError(
            `Chuyên mục này đang có ${posts.totalDocs} bài viết. Xoá nó sẽ làm các bài đó mất chuyên mục và không lưu lại được nữa. Hãy chuyển các bài sang chuyên mục khác trước, hoặc sửa tên chuyên mục này thay vì xoá.`,
            400,
          )
        }
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', label: 'Tên chuyên mục', required: true, localized: true },
    slugField,
    {
      name: 'group',
      type: 'select',
      /**
       * "Nhóm" trần dễ bị đọc nhầm thành nhóm menu bên trái của admin. Nhãn mới
       * nói rõ đây là cột nào trong menu Trung tâm kiến thức ngoài site.
       */
      label: 'Cột trong menu',
      required: true,
      /**
       * ⚠️ `value` của 2 nhóm này đang được các bản ghi trong DB tham chiếu —
       * đổi hoặc xoá là mất nhóm của những chuyên mục đang dùng nó.
       * Sửa `label` thì an toàn. Thêm cột mới thì thêm vào cuối.
       */
      options: [
        { label: 'Kế toán & Doanh nghiệp', value: 'accounting' },
        { label: 'Pháp lý & Nhân sự', value: 'legal-hr' },
      ],
      admin: {
        position: 'sidebar',
        description:
          'Menu Trung tâm kiến thức ngoài site chia làm hai cột; đây là cột chứa chuyên mục này. Bắt buộc chọn.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Mô tả ngắn',
      localized: true,
      admin: { description: 'Vài dòng giới thiệu hiện ở đầu trang chuyên mục.' },
    },
    {
      name: 'order',
      type: 'number',
      label: 'Thứ tự hiển thị',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Số nhỏ hiện trước. Để 0 hết thì sắp theo tên.' },
    },
    seoField,
  ],
}
