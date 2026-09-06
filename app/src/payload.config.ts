import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { migrations } from './migrations'
import { TENANT } from './config/tenant'
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
  InlineToolbarFeature,
  AlignFeature,
  IndentFeature,
  StrikethroughFeature,
  SubscriptFeature,
  SuperscriptFeature,
  InlineCodeFeature,
  HorizontalRuleFeature,
  ChecklistFeature,
  TextStateFeature,
} from '@payloadcms/richtext-lexical'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Categories } from './collections/Categories'
import { Services } from './collections/Services'
import { ServiceNodes } from './collections/ServiceNodes'
import { Branches } from './collections/Branches'
import { ContactSubmissions } from './collections/ContactSubmissions'
import { Settings } from './globals/Settings'
import { PayrollConfig } from './globals/PayrollConfig'
import { ALL_LOCALES, ENABLED_LOCALES, DEFAULT_LOCALE } from './lib/locales'
import { RICH_TEXT_STATE } from './lib/richTextColors'

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
    ServiceNodes,
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
  /**
   * Bộ soạn thảo bài viết.
   *
   * V3: khách yêu cầu đủ tính năng như CMS tham chiếu — căn lề, màu chữ, tô nền,
   * bảng, ảnh, chỉ số trên/dưới. Bản A1 trước đây cố tình rút gọn toolbar cho
   * nhân viên kế toán; yêu cầu mới thắng, nên mở lại. Toolbar dài hơn nhưng
   * FixedToolbarFeature xuống dòng tự động nên không tràn.
   *
   * H1 vẫn KHÔNG bật: h1 đã là tiêu đề bài (field `title`), thêm h1 trong nội
   * dung là hỏng cấu trúc SEO/a11y (§1.1 hợp đồng A1) — đây là ràng buộc kỹ
   * thuật, không phải lựa chọn giao diện, nên giữ nguyên.
   *
   * Bảng dùng EXPERIMENTAL_TableFeature: Payload đánh dấu experimental nên
   * KHÔNG bật mặc định — bật sau khi khách xác nhận cần, tránh dữ liệu bài viết
   * phụ thuộc vào một node format còn có thể đổi.
   */
  editor: lexicalEditor({
    features: () => [
      ParagraphFeature(),
      HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
      BoldFeature(),
      ItalicFeature(),
      UnderlineFeature(),
      StrikethroughFeature(),
      SubscriptFeature(),
      SuperscriptFeature(),
      InlineCodeFeature(),
      // Bảng màu nằm ở `lib/richTextColors.ts` — dùng CHUNG với RichText.tsx bên
      // trang public. Định nghĩa ở hai nơi thì lệch nhau, và triệu chứng là admin
      // thấy màu còn trang ngoài mất màu (P1-03).
      TextStateFeature({ state: RICH_TEXT_STATE }),
      AlignFeature(),
      IndentFeature(),
      UnorderedListFeature(),
      OrderedListFeature(),
      ChecklistFeature(),
      LinkFeature(),
      BlockquoteFeature(),
      HorizontalRuleFeature(),
      UploadFeature(),
      FixedToolbarFeature(),
      InlineToolbarFeature(),
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
  /**
   * `prodMigrations` là thứ tạo bảng khi NODE_ENV=production.
   *
   * Payload chỉ tự đẩy schema (push) khi NODE_ENV !== 'production'. Image chạy
   * production, nên KHÔNG có dòng này thì DB mới toanh sẽ không có bảng nào và
   * mọi truy vấn chết với "no such table: categories" — trong khi container vẫn
   * báo khởi động thành công.
   *
   * Đổi schema (thêm field, đổi collection) phải sinh migration mới:
   *     npx payload migrate:create <tên>
   * rồi commit file trong src/migrations/. Đừng sửa file migration đã chạy.
   */
  db: sqliteAdapter({
    client: { url: process.env.DATABASE_URI || `file:./${TENANT.key}.db` },
    prodMigrations: migrations,
  }),
  secret: payloadSecret,
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  sharp: (await import('sharp')).default,
})
