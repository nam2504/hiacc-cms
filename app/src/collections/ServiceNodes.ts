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
  // Tiền tố ngôn ngữ: middleware nuốt `/en` trước khi route catch-all thấy, nên
  // node mang slug này lên menu mà bấm vào chỉ ra trang chủ bản ngôn ngữ đó.
  'en',
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
    /**
     * Sắp mặc định theo nhóm cha rồi tới thứ tự trong nhóm, để bảng bên dưới sơ
     * đồ cũng đọc được theo nhóm thay vì trộn lẫn các nhóm với nhau.
     */
    description:
      'Cây dịch vụ. Sơ đồ phía trên cho thấy mục nào nằm trong nhóm nào; bảng bên dưới để sửa. Mục không chọn "Thuộc nhóm" là nhóm cấp cao nhất, hiện trên thanh menu. Mục có chọn là hạng mục con của nhóm đó.',
    /**
     * Payload 3 chưa có view cây sẵn, nên gắn thêm một sơ đồ CHỈ ĐỌC ngay trên
     * bảng danh sách (`components/admin/ServiceTree.tsx`).
     *
     * Cố ý KHÔNG thay bảng: mọi thao tác sửa vẫn đi qua form chuẩn của Payload,
     * nên hook chặn vòng lặp và chặn slug trùng route ở cuối file này vẫn là
     * đường duy nhất dữ liệu đi qua.
     *
     * ⚠️ Đổi đường dẫn này thì PHẢI chạy lại `npm run generate:importmap`,
     * nếu không admin chết "Module not found".
     */
    components: {
      beforeListTable: ['@/components/admin/ServiceTree'],
    },
  },
  labels: { singular: 'Mục dịch vụ', plural: 'Cây dịch vụ' },
  /**
   * Sắp theo nhóm cha để bảng bên dưới sơ đồ gom được các mục cùng nhóm lại với
   * nhau, thay vì 37 dòng trộn lẫn. Cấu trúc cha–con thì đọc ở sơ đồ phía trên.
   */
  defaultSort: 'parent',
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
        /**
         * Ô rỗng mặc định hiện `<No Thuộc nhóm>` — đọc như dữ liệu bị thiếu,
         * trong khi bỏ trống ở đây là trạng thái ĐÚNG (nhóm cấp cao nhất).
         * Cell riêng hiện chữ "root" cho đúng nghĩa.
         *
         * ⚠️ Đổi đường dẫn này thì PHẢI chạy lại `npm run generate:importmap`.
         */
        components: {
          Cell: '@/components/admin/ParentCell',
        },
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
    /**
     * Chặn xoá nhóm còn hạng mục con.
     *
     * Không chặn thì SQLite set `parent = NULL` cho toàn bộ con: chúng lặng lẽ
     * thành nhóm cấp cao nhất, nhảy lên thanh menu, và ĐỔI URL công khai — URL cũ
     * 404, mất thứ hạng Google, admin không báo một chữ nào.
     *
     * Đây cũng là đường đi vòng qua `RESERVED_ROOT_SLUGS`: node con được phép mang
     * slug cấm (nằm dưới cha thì không đụng route cấp 1), xoá cha là nó lên gốc
     * với slug cấm mà không qua `beforeChange`.
     */
    beforeDelete: [
      async ({ id, req }) => {
        const children = await req.payload.find({
          collection: 'service-nodes',
          where: { parent: { equals: id } },
          limit: 0,
          depth: 0,
          req,
        })

        if (children.totalDocs > 0) {
          throw new APIError(
            `Nhóm này đang chứa ${children.totalDocs} hạng mục. Xoá nhóm sẽ làm đổi đường dẫn của tất cả hạng mục bên trong và mọi link cũ sẽ hỏng. Hãy chuyển chúng sang nhóm khác (sửa ô "Thuộc nhóm" của từng mục) rồi mới xoá nhóm này.`,
            400,
          )
        }
      },
    ],
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
