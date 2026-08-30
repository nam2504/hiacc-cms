# PRE-LAUNCH.md — checklist trước khi bàn giao / go-live

Chạy hết checklist này trên **môi trường staging/production thật** (không
phải máy dev) trước khi đưa domain thật cho khách dùng.

## 1. 19 route trả 200

```bash
BASE="http://localhost:3000"   # đổi thành domain thật khi chạy trên server

for route in \
  "/" \
  "/gioi-thieu" \
  "/dich-vu" \
  "/lien-he" \
  "/tin-tuc" \
  "/chuyen-muc" \
  "/admin" \
  "/cong-cu/tinh-luong" ; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE$route")
  echo "$route -> $code"
done

# + từng slug động: 7 dịch vụ, 12 chuyên mục, 3 bài viết, 3 trang tĩnh
# (lấy danh sách slug thật từ /admin của môi trường đang kiểm, vì slug
# có thể đã đổi so với seed mẫu).
```
Kỳ vọng: tất cả 200. Route nào không phải 200 thì dừng lại tra nguyên nhân
trước khi launch.

> Chưa verify được đủ cả 19 route trên môi trường production thật ở gói
> này — mới verify `/` và `/admin` trên container local (xem báo cáo W8
> mục 2). Người launch thật cần tự chạy checklist này trên domain thật.

## 2. 404 thật cho URL lạ

```bash
curl -s -o /dev/null -w "%{http_code}\n" "$BASE/duong-dan-khong-ton-tai-abc123"
```
Kỳ vọng: 404, và trang hiển thị có Header/Footer (không phải trang 404 trắng
mặc định của Next — xem INTERFACE-W0.md §7.2 về catch-all route).

## 3. robots.txt và sitemap.xml đúng domain thật

```bash
curl -s "$BASE/robots.txt"
curl -s "$BASE/sitemap.xml" | head -20
```
Kiểm tra bằng mắt: domain trong hai file này phải là domain thật (khớp
`NEXT_PUBLIC_SITE_URL` đã đặt trong `app/.env` của môi trường production —
xem docs/DEPLOY.md mục 1.3), **không phải** `localhost`.

## 4. Form liên hệ gửi được và vào admin

1. Vào `$BASE/lien-he`, điền form thật, gửi.
2. Đăng nhập `/admin` → menu **Khách để lại liên hệ** → xác nhận bản ghi
   vừa gửi xuất hiện, `handled = false` (chưa tick).
3. **Xoá bản ghi test này** sau khi xác nhận xong (nút Delete trong admin,
   chỉ tài khoản Quản trị viên xoá được) — không được để lại dữ liệu test
   giả trong bảng liên hệ thật của khách.

## 5. Backup/restore đã diễn tập

```bash
./scripts/backup.sh
# ghi lại tên file .tar.gz vừa tạo, thử restore trên bản backup đó
# (khuyến nghị thử trên bản sao dữ liệu, không thử trực tiếp trên production
# nếu chưa quen — xem docs/DEPLOY.md mục 4.3)
```
Đã verify quy trình này thành công trên container test ở gói W8 (xem báo
cáo mục 4) — MD5 file DB khớp trước/sau restore, media đủ file, site chạy
lại bình thường sau restore.

## 6. Không còn dữ liệu seed mẫu lộ ra ngoài

Seed mẫu (`npm run seed`, xem `app/src/seed/data.ts`) tạo 12 chuyên mục · 7
dịch vụ · 5 chi nhánh · 3 trang tĩnh · 3 bài viết — nội dung này là **mẫu
tham khảo**, không phải nội dung thật của khách.

Trước khi launch, kiểm tra trong `/admin`:
- [ ] Nội dung bài viết/trang/dịch vụ đã được khách duyệt hoặc thay bằng nội
      dung thật (xem INTERFACE-W0.md §7.4 — phần lời văn marketing do coder
      viết theo site tham chiếu, **chưa ai duyệt**, phải đưa khách đọc trước).
- [ ] 5 chi nhánh có địa chỉ/điện thoại/email đúng thật, không phải placeholder.
- [ ] Không có bài viết/trang nào còn ở trạng thái "Draft" mà lẽ ra phải
      Publish (hoặc ngược lại — bài nháp không nên vô tình bị publish).
- [ ] Không còn bản ghi test trong "Khách để lại liên hệ" (xem mục 4 ở trên).

## 7. Đã đổi mật khẩu admin mặc định

- [ ] Tài khoản admin đầu tiên (tạo lúc setup ban đầu) đã đổi sang mật khẩu
      thật, đủ mạnh — không dùng mật khẩu mẫu/mật khẩu đặt lúc demo.
- [ ] Nếu môi trường dev/staging từng dùng chung email admin (ví dụ
      `admin@gmail.com`), xác nhận **production dùng email + mật khẩu khác**,
      không tái sử dụng thông tin đăng nhập của môi trường demo.

## 8. PAYLOAD_SECRET là giá trị thật

- [ ] `app/.env` trên server production có `PAYLOAD_SECRET` là chuỗi sinh
      riêng bằng `openssl rand -hex 32` cho môi trường này — **không phải**
      giá trị đã dùng ở máy dev, không phải chuỗi để trống.
- [ ] Xác nhận container khởi động bình thường và `/admin` trả 200 sau khi
      đặt secret thật (nếu quên đặt, `/admin` và `/api/*` sẽ lỗi 500 kèm
      thông báo tiếng Việt trong `docker compose logs app` — xem
      docs/DEPLOY.md mục 6.2).
