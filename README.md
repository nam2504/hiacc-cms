# HiACC CMS

Website + trang quản trị nội dung cho HiACC (dịch vụ kế toán).
Next.js 16 · Payload CMS 3 · SQLite.

Toàn bộ nội dung hiển thị trên website đều sửa được trong `/admin` — không có
chữ nào hardcode trong code.

## Tài liệu

| Đọc cái này | Khi bạn là |
|---|---|
| [`docs/HUONG-DAN-KHACH.md`](docs/HUONG-DAN-KHACH.md) | **Người cập nhật nội dung** — viết bài, sửa hotline, xem khách để lại liên hệ. Không cần biết lập trình. |
| [`docs/DEPLOY.md`](docs/DEPLOY.md) | **Người triển khai server** — cài Docker, chạy production, backup/restore |
| [`docs/PRE-LAUNCH.md`](docs/PRE-LAUNCH.md) | Checklist chạy trước khi go-live |
| [`AUDIT-hiacc.com.vn.md`](AUDIT-hiacc.com.vn.md) | Audit site tham chiếu — đọc trước khi bàn spec |
| [`ESTIMATE.md`](ESTIMATE.md) | Phạm vi + báo giá |
| [`MEDIA-CREDITS.md`](MEDIA-CREDITS.md) | Nguồn ảnh stock đang dùng làm dữ liệu mẫu |

## Chạy local

```bash
cd app
cp .env.example .env     # rồi sửa PAYLOAD_SECRET thành chuỗi ngẫu nhiên của bạn
npm install
npm run dev              # http://localhost:3000  ·  admin: /admin
npm run seed             # nạp nội dung mẫu (idempotent, không đè nội dung đã sửa)
```

Lần đầu vào `/admin` sẽ hỏi tạo tài khoản quản trị.

> **Repo không chứa database và ảnh.** `hiacc.db` và `app/public/media/` bị
> gitignore, nên bản clone mới sẽ trống cho tới khi chạy `npm run seed`. Ảnh
> stock không đi kèm — bài viết sẽ không có ảnh đại diện cho tới khi bạn tải
> ảnh lên trong `/admin`.

## Cấu trúc

| Đường dẫn | Vai trò |
|---|---|
| `app/src/collections/ServiceNodes.ts` | **Cây dịch vụ** — nhóm + hạng mục con, tự sinh route (`/[...slug]`). Nơi chính để thêm/sửa dịch vụ. |
| `app/src/collections/PricingPlans.ts` | Gói giá, gắn với 1 nhóm gốc trong Cây dịch vụ — nguồn dữ liệu cho `/bang-gia`. |
| `app/src/collections/Pages.ts` | **Trang tĩnh** — đúng 2 bản ghi cố định (Giới thiệu, Liên hệ), mỗi bản ghi buộc với 1 route viết tay. Không tạo được bản ghi mới. |
| `app/src/collections/Posts.ts`, `Categories.ts` | Bài viết + chuyên mục (route `/tin-tuc`, `/chuyen-muc`). |
| `app/src/collections/Branches.ts` | Chi nhánh (đang ẩn khỏi trang chủ, xem `page.tsx`). |
| `app/src/collections/LegalDocuments.ts` | Danh mục văn bản pháp luật. |
| `app/src/collections/ContactSubmissions.ts` | Nơi lưu form liên hệ khách gửi. |
| `app/src/collections/Services.ts` | **Legacy — đã bị Cây dịch vụ thay thế, ẩn khỏi admin.** Chỉ còn để `seed/migrateServices.ts` đọc nốt nội dung cũ; xoá hẳn là việc riêng, làm khi xác nhận cây đã có đủ 7 mục. |
| `app/src/globals/Settings.ts` | Cấu hình toàn site: tên, logo, màu, liên hệ, mạng xã hội — khách sửa trong `/admin`. |
| `app/src/config/tenant.ts` | Fallback thương hiệu theo tenant khi Settings còn trống — xem mục Multi-tenant. |
| `app/src/lib/locales.ts` | `ENABLED_LOCALES` — bật thêm ngôn ngữ sửa đúng file này |
| `app/src/seed/` | Nội dung mẫu, chạy được nhiều lần (idempotent) |
| `scripts/` | Backup / restore database |

## Multi-tenant (nhiều website, cùng codebase)

Repo phục vụ nhiều khách trên CÙNG một codebase — mỗi site chạy 1 process +
1 database riêng, không share dữ liệu. Cấu hình duy nhất ở
`app/src/config/tenant.ts`.

Dựng thêm 1 website mới = 3 việc, **không sửa code**:

1. Thêm 1 khoá vào `TENANTS` trong `tenant.ts` (tên hiển thị, tên pháp nhân,
   màu thương hiệu, slogan) — nếu tenant đã có sẵn trong danh sách thì bỏ qua.
2. Set biến môi trường `TENANT=<key>` và trỏ `DATABASE_URI` sang file DB
   riêng (deploy thật thì là app Fly.io + volume riêng).
3. Vào `/admin` của site mới, điền `Settings` (tên, logo, hotline, mạng xã
   hội...) và nhập nội dung (bài viết, dịch vụ, chuyên mục) — mỗi tenant có
   Settings và nội dung độc lập hoàn toàn.

Giá trị trong `TENANTS` chỉ là **fallback** khi Settings trong DB còn trống —
khách sửa gì trong `/admin` thì cái đó luôn thắng (`brandName()`).

Chạy thử 1 tenant thứ hai ở local (không đụng `hiacc.db` đang dùng):

```bash
cd app
TENANT=hitax DATABASE_URI=file:./hitax.db PORT=3001 \
NEXT_PUBLIC_SERVER_URL=http://localhost:3001 NEXT_PUBLIC_SITE_URL=http://localhost:3001 \
npm run dev
# terminal khác, cùng biến môi trường:
TENANT=hitax DATABASE_URI=file:./hitax.db npm run seed   # nội dung mẫu riêng cho site này
```

## Đa ngôn ngữ

Giai đoạn 1 chạy tiếng Việt. Hạ tầng 4 ngôn ngữ (中文 / EN / 한국어) đã dựng sẵn
ở tầng schema — DB có sẵn các bảng `*_locales`. Bật thêm ngôn ngữ = sửa
`ENABLED_LOCALES` rồi nhập bản dịch trong admin, **không phải sửa code**.

## Trước khi deploy

Chi tiết ở [`docs/DEPLOY.md`](docs/DEPLOY.md). Ba việc bắt buộc:

- Đặt `PAYLOAD_SECRET` mới trong `.env` trên server (không dùng lại giá trị dev)
- Đặt `NEXT_PUBLIC_SERVER_URL` thành domain thật — sai thì sitemap và thẻ
  chia sẻ mạng xã hội trỏ về localhost
- Bật lịch backup `scripts/backup.sh` (database là 1 file SQLite)

**Database giữ SQLite cho bản đầu** — site nội dung tĩnh, traffic thấp, backup
là copy 1 file. Adapter đọc từ env nên đổi sang Postgres sau chỉ tốn 1 file +
biến môi trường. Lưu ý: rate limit của form liên hệ lưu trong bộ nhớ tiến
trình, nên **chạy nhiều instance thì phải thay bằng store dùng chung**.
