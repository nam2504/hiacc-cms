import type {
  Access,
  CollectionBeforeValidateHook,
  CollectionConfig,
  FieldAccess,
} from 'payload'
import { isAdmin, isStaff, isStaffUser } from '../access'
import type { User } from '@/payload-types'

/**
 * [A1] Ai được TẠO bản ghi liên hệ.
 *
 * Form public KHÔNG đi qua hàm này: Server Action `submitContactForm`
 * (src/app/(site)/lien-he/actions.ts) ghi bằng Local API với
 * `overrideAccess: true`, nên Payload bỏ qua access hoàn toàn. Honeypot +
 * rate-limit + chống trùng trong Server Action vẫn là cửa duy nhất của form ngoài.
 *
 * Hàm này chỉ chắn đường REST/GraphQL. Trước đây `create: () => true` mở cho mọi
 * người, nên bot bắn thẳng `POST /api/contact-submissions` là vòng qua sạch mọi
 * lớp chống spam (REVIEW-security P0 #1).
 *
 * Hai nhánh, để Local API gọi ở chỗ khác mà quên `overrideAccess` vẫn chạy được:
 *   1. Local API (chạy trong tiến trình server, không phơi ra ngoài) → cho phép.
 *   2. REST/GraphQL → chỉ staff đã đăng nhập (nhân viên nhập tay hộ khách trong /admin).
 */
const canCreateSubmission: Access = ({ req }) => {
  if (req.payloadAPI === 'local') return true
  return isStaffUser(req.user as User | null | undefined)
}

/**
 * [A2] `handled` chỉ nhân viên được ghi — chặn ở HAI tầng.
 *
 * Field này quyết định bản ghi còn nằm trong hàng chờ "cần gọi lại" hay không,
 * nên người gửi form không được tự đặt (REVIEW-security P0 #2).
 *
 * Tầng 1 — field access (dưới đây): chặn đường REST/GraphQL, giống cách `role`
 * trong Users.ts khoá bằng `isAdminField`.
 *
 * Tầng 2 — hook `beforeValidate` (forceHandledFalseOnCreate): field access KHÔNG
 * chạy khi gọi Local API với `overrideAccess: true` — đã kiểm chứng bằng cách gọi
 * thật, `handled: true` lọt xuống DB. Đó đúng là đường Server Action dùng, nên
 * riêng field access là chưa đủ; hook cưỡng chế `handled = false` ở mọi lượt
 * create không do staff đăng nhập thực hiện.
 */
const staffOnlyField: FieldAccess = ({ req }) => isStaffUser(req.user as User | null | undefined)

/**
 * [A2] Tầng 2: ép `handled = false` khi bản ghi được TẠO mà không có staff đăng
 * nhập đứng sau. Chạy cả với `overrideAccess: true`, nên bịt được lỗ mà field
 * access không với tới. Staff tạo tay trong /admin vẫn tick được như cũ.
 */
const forceHandledFalseOnCreate: CollectionBeforeValidateHook = ({ data, req, operation }) => {
  if (operation !== 'create' || !data) return data
  if (isStaffUser(req.user as User | null | undefined)) return data
  return { ...data, handled: false }
}

/** Site cũ KHÔNG có form nào (AUDIT §4) — đây là tính năng thêm mới. */
export const ContactSubmissions: CollectionConfig = {
  slug: 'contact-submissions',
  admin: {
    useAsTitle: 'name',
    group: 'Hệ thống',
    defaultColumns: ['name', 'phone', 'fieldOfInterest', 'handled', 'createdAt'],
    description:
      'Thông tin khách gửi qua form Liên hệ trên website. Gọi lại xong thì tick "Đã liên hệ lại".',
  },
  labels: { singular: 'Liên hệ', plural: 'Khách để lại liên hệ' },
  hooks: { beforeValidate: [forceHandledFalseOnCreate] },
  access: {
    create: canCreateSubmission, // form public đi Local API, REST chỉ mở cho staff — xem chú thích trên
    read: isStaff,
    update: isStaff, // để nhân viên tick "đã liên hệ lại"
    delete: isAdmin, // giữ lại dấu vết khách hàng, chỉ admin được dọn
  },
  fields: [
    {
      name: 'salutation',
      type: 'select',
      label: 'Anh/Chị',
      options: [
        { label: 'Anh', value: 'anh' },
        { label: 'Chị', value: 'chi' },
      ],
    },
    { name: 'name', type: 'text', label: 'Họ tên', required: true },
    { name: 'phone', type: 'text', label: 'Điện thoại', required: true },
    { name: 'email', type: 'email', label: 'Email' },
    /**
     * [T-fb1.6] Theo REQUIREMENTS-hiacc-v2.md §3 (form mockup): "Lĩnh vực"
     * là select chọn 1 trong các nhóm dịch vụ. Lưu TEXT (tên nhóm tại thời
     * điểm gửi), không phải relationship tới `service-nodes` — nhóm dịch vụ
     * có thể đổi tên/xoá sau này (T-review-fix-2 đã thêm hook xoá nhóm), khi
     * đó bản ghi liên hệ cũ vẫn phải giữ nguyên "khách quan tâm gì lúc gửi",
     * không rơi vào bản ghi mồ côi.
     */
    { name: 'fieldOfInterest', type: 'text', label: 'Lĩnh vực quan tâm' },
    { name: 'message', type: 'textarea', label: 'Nội dung' },
    {
      name: 'handled',
      type: 'checkbox',
      label: 'Đã liên hệ lại',
      defaultValue: false,
      access: { create: staffOnlyField, update: staffOnlyField },
      admin: {
        position: 'sidebar',
        description: 'Tick sau khi đã gọi/gửi mail cho khách, để người khác khỏi gọi trùng.',
      },
    },
  ],
}
