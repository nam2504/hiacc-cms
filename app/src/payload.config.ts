import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import {
  lexicalEditor,
  BoldFeature,
  ItalicFeature,
  UnderlineFeature,
  ParagraphFeature,
  HeadingFeature,
  UnorderedListFeature,
  OrderedListFeature,
  LinkFeature,
  BlockquoteFeature,
  UploadFeature,
  FixedToolbarFeature,
} from '@payloadcms/richtext-lexical'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Categories } from './collections/Categories'
import { Services } from './collections/Services'
import { Branches } from './collections/Branches'
import { ContactSubmissions } from './collections/ContactSubmissions'
import { Settings } from './globals/Settings'
import { PayrollConfig } from './globals/PayrollConfig'
import { ALL_LOCALES, ENABLED_LOCALES, DEFAULT_LOCALE } from './lib/locales'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * [A3] Chuỗi ký cookie phiên đăng nhập. KHÔNG có giá trị mặc định trong source:
 * fallback cũ là một chuỗi mẫu nằm công khai trong repo, ai đọc source cũng biết
 * và có thể tự ký cookie admin (REVIEW-security P0 #3).
 *
 * Thiếu env → ném lỗi ngay lúc khởi động, thay vì chạy tiếp với secret đoán được.
 * Sinh giá trị mới bằng: openssl rand -hex 32
 */
const payloadSecret = process.env.PAYLOAD_SECRET?.trim()

if (!payloadSecret) {
  throw new Error(
    'PAYLOAD_SECRET chưa được đặt. Thêm vào .env (hoặc biến môi trường của môi trường deploy) ' +
      'một chuỗi ngẫu nhiên dài, ví dụ sinh bằng: openssl rand -hex 32',
  )
}

export default buildConfig({
  admin: { user: Users.slug, importMap: { baseDir: path.resolve(dirname) } },
  // Thứ tự này là thứ tự hiện trong menu bên trái của /admin.
  // Nhóm "Nội dung" (việc hằng ngày của biên tập viên) lên trước,
  // rồi "Cấu hình", cuối cùng là "Hệ thống".
  collections: [
    // Nội dung
    Posts,
    Pages,
    Services,
    Categories,
    Media,
    // Cấu hình
    Branches,
    // Hệ thống
    ContactSubmissions,
    Users,
  ],
  // PayrollConfig (W5): số liệu luật của công cụ tính lương Gross ↔ Net.
  // Cùng nhóm "Cấu hình" với Settings trong menu /admin.
  globals: [Settings, PayrollConfig],
  // [A1] Bộ soạn thảo cho nhân viên kế toán, không phải dev — chỉ giữ những nút
  // họ thật sự cần, để toolbar ngắn và không phải đoán bấm gì.
  // Toolbar cố định (FixedToolbarFeature) thay cho toolbar nổi mặc định: luôn
  // hiện sẵn phía trên, không cần bôi đen chữ mới thấy nút — dễ nhận ra hơn.
  // Bỏ có chủ đích: gạch ngang, chỉ số trên/dưới, code inline, căn lề, thụt lề,
  // checklist, relationship (nhúng bản ghi khác), đường kẻ ngang, toolbar nổi
  // — đều là việc kỹ thuật/blog, khách kế toán không dùng, để lại chỉ rối thêm.
  // H1 KHÔNG bật: h1 đã là tiêu đề bài (field `title`), thêm h1 trong nội dung
  // là hỏng cấu trúc SEO/a11y (§1.1 hợp đồng A1).
  editor: lexicalEditor({
    features: () => [
      ParagraphFeature(),
      HeadingFeature({ enabledHeadingSizes: ['h2', 'h3'] }),
      BoldFeature(),
      ItalicFeature(),
      UnderlineFeature(),
      UnorderedListFeature(),
      OrderedListFeature(),
      LinkFeature(),
      BlockquoteFeature(),
      UploadFeature(),
      FixedToolbarFeature(),
    ],
  }),
  // i18n dựng sẵn 4 ngôn ngữ: bật thêm chỉ cần sửa ENABLED_LOCALES, không đụng code.
  localization: {
    locales: ALL_LOCALES.filter((l) => ENABLED_LOCALES.includes(l.code)).map((l) => ({
      code: l.code,
      label: l.label,
    })),
    defaultLocale: DEFAULT_LOCALE,
    fallback: true,
  },
  db: sqliteAdapter({ client: { url: process.env.DATABASE_URI || 'file:./hiacc.db' } }),
  secret: payloadSecret,
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  sharp: (await import('sharp')).default,
})
