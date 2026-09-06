# Brief — review bằng TRÌNH DUYỆT THẬT (lớp lỗi client-side)

> Neo: nhánh `feat/tenant-tach-va-cay-dich-vu`, HEAD `be6d797`, 2026-09-07.
> Dev server chạy sẵn: http://localhost:3000 · admin `admin@gmail.com` / `Admin@123`.

## Vì sao có bạn

Hai reviewer khác đang chạy nhưng cả hai đo bằng `curl` — tức là chỉ thấy HTML server trả về.
Toàn bộ lớp lỗi **chỉ xảy ra khi trang thật sự chạy trong trình duyệt** hiện KHÔNG AI đo:
console error · JS runtime · hydration mismatch · form bấm không gửi · layout vỡ ở breakpoint
thật · ảnh không tải · nút không bấm được · focus/bàn phím.

Đó là toàn bộ phạm vi của bạn. **Đừng review code, đừng grep source** — hai người kia làm rồi.
Bạn mở trang lên, bấm vào, và ghi lại cái gì hỏng.

## ⚠️ NHIỄU ĐÃ BIẾT — không phải finding

User vừa báo một hydration error trên `/en`, diff là:
```
- data-new-gr-c-s-check-loaded="14.1326.0"
- data-gr-ext-installed=""
```
Đây là **Grammarly** (extension trình duyệt) tiêm thuộc tính vào `<body>` trước khi React
hydrate. Đã verify: server trả `<body>` trơn, hai chuỗi này không có ở đâu trong source.
→ **KHÔNG báo lại.** Và nếu console hiện hydration error, hãy đọc diff xem có phải do
extension không TRƯỚC KHI kết luận là bug. Extension hay tiêm: Grammarly (`data-gr-*`),
LastPass (`data-lastpass-*`), ColorZilla, Dark Reader (`data-darkreader-*`).
Nếu chạy được ở chế độ tắt extension / ẩn danh thì ưu tiên chế độ đó.

Hydration mismatch THẬT (đáng báo) trông khác: nội dung text lệch, thẻ lệch, thuộc tính do
CHÍNH code sinh ra lệch — ví dụ `Date`, `Math.random`, `typeof window`, format ngày theo locale.

## Phạm vi đo — cả hai mặt

### A. Website công khai
Các route: `/` `/gioi-thieu` `/lien-he` `/tin-tuc` `/chuyen-muc` `/van-ban-phap-luat`
`/ke-toan` `/ke-toan/quyet-toan-thue` `/cong-cu/tinh-luong` và bản `/en/...` tương ứng.
(`/bang-gia` 404 là ĐÚNG — chưa có mockup khách, đừng báo.)

Với mỗi trang: đọc console (error + warning), xem có ảnh/asset nào 404 trong network không.

Tương tác phải thử THẬT:
- **Form liên hệ** (`/lien-he` và khối tư vấn ở trang chủ): điền và gửi thật, xem có báo thành
  công không, thử để trống trường bắt buộc, thử email sai định dạng. Form này có honeypot +
  rate-limit theo IP — nếu bị chặn sau vài lần thì đó là ĐÚNG THIẾT KẾ, không phải bug.
- **Công cụ tính lương Gross↔Net** (`/cong-cu/tinh-luong`): nhập số thật, đổi chiều tính,
  đổi số người phụ thuộc. Đây là chỗ tính TIỀN cho khách hàng cuối — sai số hiển thị là P0.
  Thử cả input xấu: chữ, số âm, số cực lớn, dán chuỗi có dấu phẩy/chấm.
- **Chuyển ngôn ngữ VI↔EN**: bấm nút, xem có nhảy đúng trang tương ứng không, có mất
  nội dung đang xem không.
- **Mega-menu**: hover/bấm 5 nhóm dịch vụ, xem panel có mở đúng và link có đi đúng chỗ không.

Breakpoint: xem ít nhất **360px (điện thoại), 768px (tablet), 1440px (desktop)**.
Tìm: tràn ngang (trang trượt ngang là lỗi), chữ đè lên nhau, nút bị cắt, menu mobile không mở được.

### B. Trang quản trị `/admin`
Đăng nhập rồi mở: danh sách các collection · **cây dịch vụ** (`/admin/collections/service-nodes`
— vừa thêm component tuỳ biến `ServiceTree`, component admin ĐẦU TIÊN của repo, dễ vỡ nhất)
· **Settings** (`/admin/globals/settings` — vừa thêm bảng chọn màu).

Thử thật: bấm các swatch màu, dùng ô chọn màu của HĐH, gõ mã sai định dạng vào ô text,
bấm "xoá, dùng mặc định". Xem console có lỗi không, và trạng thái hiện có đúng không.
**Không cần lưu** — nếu có lưu thì phải hoàn nguyên về `#CC1420` và khai trong báo cáo.

## Cách viết finding

Hai bảng tách bạch, một finding chỉ thuộc một bảng:
- **Bảng 1 CHẶN BÀN GIAO**: người dùng cuối nhìn thấy hoặc bị chặn — lỗi console đỏ ảnh hưởng
  chức năng, form không gửi được, số tiền hiển thị sai, layout vỡ trên điện thoại, nút chết.
- **Bảng 2 NỢ KỸ THUẬT / UX**: warning console không ảnh hưởng chức năng, nhấp nháy nhẹ,
  thẩm mỹ, chi tiết a11y.

Mỗi finding phải có: **route + thao tác cụ thể + cái gì xảy ra + ảnh chụp màn hình nếu có**.
"Trang trông lạ" không phải finding. "Ở 360px, `/ke-toan`, bảng giá tràn ngang 40px làm cả
trang trượt ngang" mới là finding.

## Ràng buộc

- **KHÔNG sửa file code nào.** Bạn chỉ mở trình duyệt và quan sát.
- Không chạy `npm run seed`.
- Nếu gửi form thật tạo ra bản ghi trong DB, khai rõ trong báo cáo (bản ghi test là chấp nhận
  được, nhưng phải nói ra).
- Tránh bấm nút gây dialog xác nhận của trình duyệt (alert/confirm) — nó treo phiên tự động hoá.
