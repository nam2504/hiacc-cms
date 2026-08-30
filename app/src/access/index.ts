/**
 * Hàm phân quyền dùng chung cho toàn bộ collection.
 *
 * Chỉ có 2 vai trò (xem `users.role`):
 *   - `admin`  : toàn quyền, kể cả xoá và sửa cấu hình.
 *   - `editor` : tạo/sửa nội dung, KHÔNG được xoá, KHÔNG đụng users/settings/branches.
 *
 * Lưu ý về `read` public: các collection đang để `read: () => true` (pages, posts,
 * settings) phải GIỮ NGUYÊN — site public gọi Local API không kèm user, siết lại
 * là trang ngoài trắng ngay.
 */
import type { Access, FieldAccess } from 'payload'
import type { User } from '@/payload-types'

/** Người dùng đã đăng nhập, đã ép kiểu về User của collection `users`. */
type MaybeUser = User | null | undefined

const roleOf = (user: MaybeUser): string | null => user?.role ?? null

export const isAdminUser = (user: MaybeUser): boolean => roleOf(user) === 'admin'

/** Editor cũng tính là "đã đăng nhập vào admin" — dùng cho quyền đọc nội bộ. */
export const isStaffUser = (user: MaybeUser): boolean => {
  const role = roleOf(user)
  return role === 'admin' || role === 'editor'
}

/** Chỉ admin. Dùng cho users, settings, branches và mọi thao tác xoá. */
export const isAdmin: Access = ({ req }) => isAdminUser(req.user as MaybeUser)

/** Admin hoặc editor. Dùng cho create/update các collection nội dung. */
export const isStaff: Access = ({ req }) => isStaffUser(req.user as MaybeUser)

/** Ai cũng đọc được — site public không có user. */
export const isPublic: Access = () => true

/** Field-level: chỉ admin mới sửa được field này (ví dụ `role`). */
export const isAdminField: FieldAccess = ({ req }) => isAdminUser(req.user as MaybeUser)

/**
 * Cụm quyền chuẩn cho collection NỘI DUNG (pages, posts, categories, services, media):
 * đọc public, staff tạo/sửa, chỉ admin xoá.
 */
export const contentAccess = {
  read: isPublic,
  create: isStaff,
  update: isStaff,
  delete: isAdmin,
} as const

/**
 * Cụm quyền cho collection CẤU HÌNH (branches, users): chỉ admin ghi.
 * `read` để riêng ở từng collection vì mức công khai khác nhau.
 */
export const adminOnlyWriteAccess = {
  create: isAdmin,
  update: isAdmin,
  delete: isAdmin,
} as const
