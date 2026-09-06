# Brief — review website HiACC (chuẩn senior/staff)

> Neo: nhánh `feat/tenant-tach-va-cay-dich-vu`, HEAD `67c4702`, 2026-09-07.
> Dev server đang chạy sẵn ở http://localhost:3000.
> ⚠️ Một agent khác ĐANG GHI vào `src/collections/`, `src/globals/`, `src/components/admin/`
>    ngay lúc bạn chạy. **Bỏ qua hoàn toàn 3 vùng đó** — trang /admin sẽ có reviewer riêng.
>    Phạm vi của bạn: **website công khai** (`src/app/(site)/`, `src/components/` trừ `admin/`, `src/lib/`).

## Sản phẩm là gì

CMS + website cho khách trả tiền (dịch vụ kế toán/thuế HiACC). Sắp bàn giao.
Cùng codebase sẽ clone ra site thứ hai (HiTax) chỉ bằng đổi env `TENANT` + nội dung.
Song ngữ VI/EN: `/x` là tiếng Việt, `/en/x` là tiếng Anh (middleware rewrite + header `x-locale`).

## HAI BẢNG, TÁCH BẠCH — đây là yêu cầu chính

### Bảng 1 — CHẶN BÀN GIAO
Đo theo đúng một câu hỏi: *site này bàn giao cho khách trả tiền được chưa?*
Tính vào bảng này: lỗ hổng bảo mật · mất/lộ dữ liệu · lỗi người dùng cuối NHÌN THẤY ·
SEO hỏng (Google bỏ chỉ mục) · link chết · form không gửi được · hỏng trên điện thoại ·
nội dung sai sự thật về khách (số liệu bịa, tuyên bố chưa xác nhận).

### Bảng 2 — NỢ KỸ THUẬT
Kiến trúc, trùng lặp, đặt tên, xử lý lỗi, test coverage, thứ khách không thấy nhưng
người bảo trì sau sẽ trả giá. Vẫn phải xếp hạng, nhưng KHÔNG trộn vào bảng 1.

Một finding chỉ thuộc MỘT bảng. Xếp nhầm bảng làm hỏng giá trị của cả báo cáo.

## KHÔNG tính là lỗi (đã biết, đã quyết, đừng báo lại)

- **Thiếu nội dung khách chưa gửi.** 30/32 hạng mục dịch vụ để trống có chú thích; địa chỉ/
  phone/email 5 chi nhánh ghi "Đang cập nhật"; link mạng xã hội và `mapUrl` chưa có nên
  2 khối trang chủ tự ẩn. Đây là ĐÚNG THIẾT KẾ, chờ khách.
- **Nội dung DB chưa có bản dịch EN.** Khung site đã dịch xong; chữ khách nhập (bài viết,
  trang Giới thiệu) rơi về tiếng Việt qua fallback — đúng thiết kế, chờ khách dịch (T-content).
- `/bang-gia` trả 404 — chưa có mockup khách, không phải lỗi.
- Ảnh Unsplash trên hero và bài viết là ảnh MẪU, khách sẽ thay.
- SQLite (không phải Postgres), map bằng iframe (không dùng Google Maps API), chống spam bằng
  honeypot + rate-limit in-memory (không reCAPTCHA) — đều là quyết định đã chốt với user.
- Trần BHXH/BHYT đang dùng 46,8M — đang chờ khách xác nhận, đã biết.
- `/dich-vu` đã xoá thẳng không redirect — user chốt (site chưa lên production).

## Nền: cái gì vừa sửa xong (đừng báo lại như lỗi mới)

Commit `67c4702` (07/09): sửa bug translator đóng băng — `i18n.ts` export sẵn
`t = createTranslator(DEFAULT_LOCALE)`, 31 file gọi nó nên trang `/en` hiện tiếng Việt.
Nay server component dùng `getRequestLocale()` + `createTranslator(locale)`, 4 client component
nhận `locale` qua props. **Chỗ này vừa động dao — soi kỹ có sót hoặc gãy gì không.**

Commit `1ad2d69`: 9 chỗ `catch` trong `lib/site.ts` thêm log; script `test` nay chạy cả
`src/lib/payroll/*.test.ts` (81 test pass).

## Đã có người kiểm và BÁC BỎ — đừng đi kiểm lại

- `brandStyle.ts` regex `^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$` **không thủng XSS** — đã test
  payload newline/tag-break/css-injection, cả 4 đều bị chặn. (Nhưng nếu ai thêm cờ `m` thì thủng.)
- Hook chặn vòng lặp cây dịch vụ `ServiceNodes.ts` **chặn được** — đã test 3 kịch bản trên DB thật.
- Catch-all `[...slug]` **không nuốt** route tĩnh — đã curl 15 route.
- Matcher middleware không thủng (`/administrator`, `/apifoo` đều 404 thật).
- Nút chuyển ngôn ngữ đúng cả 4 tổ hợp; hai từ điển khớp 212/212.

## Cách làm — bắt buộc

**Mọi finding phải tái hiện được.** Ghi lệnh đã chạy + output thật. Không có bước tái hiện
thì đừng đưa vào bảng — cho xuống mục "nghi vấn chưa chứng minh" riêng.
Đo trên **HTML render thật** (`curl`), không chỉ grep source: repo này đã dính một lần
grep source sạch nhưng trang vẫn hiện chuỗi cũ vì nội dung nằm trong DB.

Nên chạy ít nhất: 11 route VI + các route `/en` tương ứng · form liên hệ · tính lương
Gross↔Net · sitemap.xml + robots.txt · canonical/hreflang trong `<head>` · thử vài input xấu.

**Cũng kiểm chính các thứ vừa sửa:** `runs/verify-i18n.sh` có đo được gì thật không, hay có
check nào luôn xanh? (Hai lỗi loại này đã tìm thấy và sửa hôm nay — có thể còn.)

## Ràng buộc

- **CHỈ ĐỌC.** Không sửa file nào. Bạn là reviewer, không phải người vá.
- Không chạy `npm run seed` (ghi vào DB thật của user).
- Không sửa/xoá test.
- Đọc `~/Desktop/hiacc-cms-L6-review.md` nếu cần biết review trước đã nêu gì (còn 5 P1 mở).
