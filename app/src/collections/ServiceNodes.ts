import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'
import { slugField, seoField } from './fields'
import { serviceBodyBlocks } from './blocks'
import { contentAccess } from '../access'

/**
 * Cây dịch vụ — thay cho collection `services` phẳng.
 *
 * Vì sao là CÂY chứ không phải 2 bảng "nhóm" + "hạng mục": requirement 06/09 có
 * 5 nhóm / 32 hạng mục, nhưng site thứ hai (HiTax) sẽ có cây khác hẳn và có thể
 * cần tầng thứ ba. Dựng cây tự tham chiếu thì thêm tầng = nhập liệu, không sửa
 * code — đúng ràng buộc "clone chỉ đổi nội dung" (WS-6 T-hitax).
 *
 * Đường dẫn sinh từ chuỗi slug của tổ tiên: node gốc `ke-toan` → `/ke-toan`,
 * con của nó `ke-toan-tron-goi` → `/ke-toan/ke-toan-tron-goi`. Route catch-all
 * `src/app/(site)/[...slug]` giải chuỗi này.
 */

/**
 * Slug cấp cao nhất không được trùng route đã khai tường minh: Next ưu tiên route
 * tĩnh nên node đó vĩnh viễn không mở được, mà admin không thấy lỗi gì.
 */
const RESERVED_ROOT_SLUGS = new Set([
  'admin',
  'api',
  'gioi-thieu',
  'lien-he',
  'tin-tuc',
  'chuyen-muc',
  'cong-cu',
  'van-ban-phap-luat',
  'bang-gia',
  'sitemap.xml',
  'robots.txt',
])

export const ServiceNodes: CollectionConfig = {
  slug: 'service-nodes',
  admin: {
    useAsTitle: 'title',
    group: 'Nội dung',
    defaultColumns: ['title', 'parent', 'order', 'slug', 'updatedAt'],
    description:
      'Cây dịch vụ. Mục không chọn "Thuộc nhóm" là nhóm cấp cao nhất, hiện trên thanh menu. Mục có chọn là hạng mục con của nhóm đó.',
  },
  labels: { singular: 'Mục dịch vụ', plural: 'Cây dịch vụ' },
  access: contentAccess,
  fields: [
    { name: 'title', type: 'text', label: 'Tên mục', required: true, localized: true },
    slugField,
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'service-nodes',
      label: 'Thuộc nhóm',
      admin: {
        position: 'sidebar',
        description:
          'Bỏ trống = nhóm cấp cao nhất, hiện trên thanh menu. Chọn một mục = nằm bên trong mục đó.',
      },
    },
    {
      name: 'order',
      type: 'number',
      label: 'Thứ tự',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Số nhỏ hiện trước. Để 0 hết thì sắp theo tên.' },
    },
    {
      name: 'icon',
      type: 'text',
      label: 'Icon',
      admin: {
        position: 'sidebar',
        description:
          'Khoá icon có sẵn: chart, folder, search, document, finance, archive, growth. Gõ sai thì dùng icon mặc định, không vỡ giao diện.',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Nội dung',
          description: 'Phần hiện trên trang. Việc cần sửa hằng ngày nằm ở đây.',
          fields: [
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              label: 'Ảnh minh hoạ',
              admin: {
                description: 'Hiện ở thẻ ngoài trang chủ và đầu trang chi tiết. Nên ảnh ngang 3:2.',
              },
            },
            {
              name: 'summary',
              type: 'textarea',
              label: 'Mô tả ngắn',
              localized: true,
              admin: { description: 'Vài dòng hiện dưới tiêu đề và trong thẻ ngoài trang chủ.' },
            },
            {
              name: 'heroStats',
              type: 'array',
              label: 'Số liệu đầu trang',
              labels: { singular: 'Số liệu', plural: 'Số liệu' },
              maxRows: 4,
              admin: {
                description:
                  'Dải số liệu dưới mô tả, ví dụ "7 / HẠNG MỤC", "03–05 / NGÀY LÀM VIỆC". Bỏ trống thì không hiện dải này.',
              },
              fields: [
                { name: 'value', type: 'text', label: 'Số liệu', required: true, localized: true },
                { name: 'label', type: 'text', label: 'Chú thích', required: true, localized: true },
              ],
            },
            {
              name: 'body',
              type: 'blocks',
              label: 'Nội dung chi tiết',
              blocks: serviceBodyBlocks,
              admin: {
                description:
                  'Chọn từng khối cần dùng rồi kéo để đổi thứ tự. Không bắt buộc dùng đủ mọi khối.',
              },
            },
          ],
        },
        { label: 'SEO', fields: [seoField] },
      ],
    },
  ],

  hooks: {
    beforeChange: [
      async ({ data, req, originalDoc, operation }) => {
        const parentId = data?.parent

        // Chỉ node gốc mới đụng route cấp 1; node con nằm dưới slug của cha nên
        // trùng tên là chuyện bình thường.
        if (!parentId && data?.slug && RESERVED_ROOT_SLUGS.has(String(data.slug))) {
          throw new APIError(
            `Đường dẫn "${data.slug}" đã được trang khác của website dùng. Mục này sẽ không mở được. Chọn đường dẫn khác.`,
            400,
          )
        }
        if (!parentId) return data

        const selfId = originalDoc?.id ?? (operation === 'update' ? data?.id : undefined)
        const parentKey = typeof parentId === 'object' ? parentId?.id : parentId

        if (selfId && String(parentKey) === String(selfId)) {
          throw new APIError('Một mục không thể là nhóm cha của chính nó.', 400)
        }

        /**
         * Chặn vòng lặp A→B→A. Không chặn thì trang tự gọi đệ quy tới khi tràn
         * stack — hỏng cả site public, không chỉ một trang.
         */
        if (selfId) {
          const seen = new Set<string>([String(selfId)])
          let cursor: unknown = parentKey
          // Trần 20 tầng: cây dịch vụ thật sâu nhất 3 tầng; chạm 20 nghĩa là dữ
          // liệu đã hỏng, dừng còn hơn quét vô hạn.
          for (let depth = 0; depth < 20 && cursor; depth += 1) {
            const key = String(typeof cursor === 'object' ? (cursor as { id: string }).id : cursor)
            if (seen.has(key)) {
              throw new APIError(
                'Chọn nhóm cha như vậy tạo thành vòng lặp (A nằm trong B, B lại nằm trong A). Chọn nhóm khác.',
                400,
              )
            }
            seen.add(key)
            const ancestor = await req.payload.findByID({
              collection: 'service-nodes',
              id: key,
              depth: 0,
              req,
            })
            cursor = ancestor?.parent ?? null
          }
        }

        return data
      },
    ],
  },
}
