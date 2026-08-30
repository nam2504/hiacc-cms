# HiACC CMS

CMS cho khách HiACC (dịch vụ kế toán). Next.js 16 + Payload 3 + SQLite (dev).

| File | Nội dung |
|---|---|
| `AUDIT-hiacc.com.vn.md` | Audit site tham chiếu — đọc trước khi bàn spec |
| `ESTIMATE.md` | Phạm vi + báo giá nháp (đơn giá để trống) |
| `app/` | Mã nguồn |
| `hiacc-logo.png` | Logo khách · đỏ chủ đạo `#CC1420` |

## Chạy local

```bash
cd app
npm install
npm run dev      # http://localhost:3000  ·  admin: /admin
```

Lần đầu vào `/admin` sẽ hỏi tạo tài khoản quản trị.

## Đa ngôn ngữ

Giai đoạn 1 chạy tiếng Việt. Hạ tầng 4 ngôn ngữ đã dựng sẵn ở tầng schema —
DB có sẵn các bảng `*_locales`. Bật thêm ngôn ngữ: sửa `ENABLED_LOCALES`
trong `src/lib/locales.ts`, **không phải sửa code**.

## Trước khi deploy

- Đổi `PAYLOAD_SECRET` trong `.env`
- Chuyển SQLite → Postgres (`@payloadcms/db-postgres`)
- Cân nhắc chuyển `media` sang object storage nếu ảnh nhiều
