import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminField, isAdminUser } from '../access'
import type { User } from '@/payload-types'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    group: 'Hệ thống',
    defaultColumns: ['name', 'email', 'role'],
    description: 'Tài khoản đăng nhập trang quản trị. Chỉ Quản trị viên mới thêm/sửa/xoá được.',
  },
  labels: { singular: 'Người dùng', plural: 'Người dùng' },
  access: {
    /**
     * Admin đọc mọi tài khoản; editor CHỈ đọc chính mình — cần thiết để trang
     * admin dựng được menu tài khoản, siết cứng về isAdmin là editor không vào nổi.
     */
    read: ({ req }) => {
      const user = req.user as User | null | undefined
      if (isAdminUser(user)) return true
      if (!user) return false
      return { id: { equals: user.id } }
    },
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
    /** Chỉ admin được vào /admin ở vai trò quản trị; editor vẫn vào được panel. */
    admin: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'name', type: 'text', label: 'Họ tên', required: true },
    {
      name: 'role',
      type: 'select',
      label: 'Vai trò',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Quản trị viên', value: 'admin' },
        { label: 'Biên tập viên', value: 'editor' },
      ],
      // Chặn editor tự nâng quyền chính mình nếu sau này mở quyền sửa hồ sơ.
      access: { create: isAdminField, update: isAdminField },
      admin: {
        description:
          'Quản trị viên: toàn quyền, kể cả xoá và sửa cấu hình. Biên tập viên: chỉ viết và sửa nội dung, không xoá được gì.',
      },
    },
  ],
}
