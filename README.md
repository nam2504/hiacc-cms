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
| `app/src/collections/` | 8 collection CMS (Bài viết, Dịch vụ, Chi nhánh, Trang, Chuyên mục, Ảnh, Liên hệ, Người dùng) |
| `app/src/lib/brand.ts` | Màu chủ đạo `#CC1420` — lấy từ logo. Dùng hằng này, đừng viết mã màu chỗ khác. |
| `app/src/lib/locales.ts` | `ENABLED_LOCALES` — bật thêm ngôn ngữ sửa đúng file này |
| `app/src/seed/` | Nội dung mẫu |
| `scripts/` | Backup / restore database |

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
