# Hướng dẫn sử dụng trang quản trị website HiACC

Tài liệu này dành cho người trực tiếp cập nhật nội dung website (không cần
biết lập trình). Nếu gặp việc ngoài phạm vi hướng dẫn dưới đây, xem mục 7
"Việc cần gọi dev".

---

## 1. Đăng nhập và đổi mật khẩu

1. Mở trình duyệt, vào địa chỉ `<domain-website>/admin` (ví dụ
   `https://hiacc.com.vn/admin`).
2. Nhập email và mật khẩu được cấp.
3. **Đổi mật khẩu ngay lần đăng nhập đầu tiên**: bấm vào tên/email của bạn ở
   góc trên bên phải → chọn hồ sơ tài khoản → đổi mật khẩu.

> Nếu quên mật khẩu, liên hệ dev — chức năng "quên mật khẩu qua email" hiện
> chưa bật, xem mục 7.

---

## 2. Sửa thông tin liên hệ, hotline, email, mạng xã hội, 5 chi nhánh

### 2.1 Thông tin chung (hotline, email, địa chỉ trụ sở, mạng xã hội)

Vào menu bên trái → **Cấu hình chung**. Có các tab:
- **Thương hiệu**: tên website, logo, slogan.
- **Liên hệ**: hotline, hotline phụ, email, địa chỉ trụ sở, mã số thuế, tên
  công ty.
- **Mạng xã hội**: link Facebook, TikTok, YouTube, Twitter, mã QR Zalo.
- **Footer**: giới thiệu ngắn, dòng bản quyền.

Điền xong bấm **Save** ở góc trên. Số điện thoại/email nào để trống thì dòng
đó tự ẩn trên website, không hiện ô trống xấu.

⚠️ **Quan trọng — điền mạng xã hội để hiện khối "Kết nối với chúng tôi" ở
trang chủ**: hiện tại trang chủ đang **ẩn** khối liên kết mạng xã hội vì
chưa có link nào được điền. Chỉ cần điền **một** link bất kỳ (Facebook,
TikTok, YouTube hoặc Twitter) trong tab "Mạng xã hội" rồi Save, khối này sẽ
tự hiện ra ở trang chủ ngay — không cần làm gì thêm.

### 2.2 5 chi nhánh

Vào menu bên trái → **Chi nhánh**. Bấm vào từng chi nhánh để sửa: địa chỉ,
điện thoại, email, link Google Maps.

Cách lấy link Google Maps: mở Google Maps, tìm đúng địa chỉ chi nhánh, bấm
nút **Chia sẻ** → **Sao chép liên kết**, dán vào ô "Link Google Maps". Đây
**không phải** đoạn mã nhúng `<iframe>`, chỉ là một đường link bình thường.

⚠️ **Điền "Link Google Maps" thì nút "Xem bản đồ" mới hiện ra** ở khối chi
nhánh trên trang chủ và trang Liên hệ. Chi nhánh nào chưa có link này thì
chỉ hiện địa chỉ chữ, không có nút bấm mở bản đồ.

Muốn đổi thứ tự hiển thị các chi nhánh: sửa ô "Thứ tự" (số nhỏ hiện trước,
trụ sở chính nên để 0).

---

## 3. Viết bài mới

1. Menu bên trái → **Tin tức**.
2. Bấm **Create New**.
3. Điền tiêu đề (đường dẫn/slug tự sinh theo tiêu đề, có thể sửa tay nếu
   cần).
4. Chọn **chuyên mục** ở khung bên phải.
5. Tải ảnh đại diện: bấm vào ô ảnh → chọn ảnh có sẵn trong thư viện hoặc tải
   ảnh mới lên.
6. Viết nội dung ở khung soạn thảo chính — dùng được chữ đậm/nghiêng, chèn
   ảnh, chèn link như soạn thảo văn bản thông thường.
7. Ở góc trên bên phải có 2 nút:
   - **Save draft** (lưu nháp) — bài chỉ bạn và đồng nghiệp trong admin thấy
     được, **chưa hiện** ra website.
   - **Publish** (xuất bản) — bài chính thức lên website ngay lập tức.

Muốn sửa bài đã xuất bản: mở lại bài, sửa nội dung, bấm **Save** — thay đổi
lên website ngay, không cần publish lại.

---

## 4. Sửa nội dung trang tĩnh, sửa dịch vụ

- **Trang tĩnh** (ví dụ trang Giới thiệu): menu bên trái → **Trang**, chọn
  trang cần sửa, sửa nội dung, Save hoặc Publish giống mục 3.
- **Dịch vụ**: menu bên trái → **Dịch vụ**, chọn dịch vụ cần sửa tên, mô tả,
  ảnh minh hoạ, bấm **Save**. Dịch vụ **không có** bước nháp/xuất bản riêng —
  Save là lên website ngay.

---

## 5. Xem danh sách khách để lại liên hệ

Menu bên trái → **Khách để lại liên hệ**. Đây là danh sách khách điền form
"Liên hệ" trên website (họ tên, điện thoại, email, nội dung).

Sau khi đã gọi điện hoặc nhắn tin lại cho khách, mở bản ghi đó, tick ô **Đã
liên hệ lại** ở khung bên phải rồi Save — để đồng nghiệp khác biết khách này
đã được xử lý, tránh gọi trùng.

---

## 6. Phân biệt tài khoản Quản trị viên vs Biên tập viên

| Việc | Quản trị viên | Biên tập viên |
|---|---|---|
| Viết/sửa bài, trang, dịch vụ | ✅ | ✅ |
| Tải ảnh lên thư viện | ✅ | ✅ |
| Xem danh sách liên hệ, tick "đã liên hệ lại" | ✅ | ✅ |
| **Xoá** bài viết/trang/dịch vụ/ảnh | ✅ | ❌ |
| Sửa **Cấu hình chung** (hotline, MXH, logo...) | ✅ | ❌ |
| Sửa **Chi nhánh** | ✅ | ❌ |
| Thêm/xoá **tài khoản** người dùng khác | ✅ | ❌ |
| Xoá bản ghi **khách liên hệ** | ✅ | ❌ |

Nói ngắn gọn: Biên tập viên lo phần **viết nội dung hằng ngày**, không đụng
được vào cấu hình chung hay xoá dữ liệu — tránh xoá nhầm hoặc sửa nhầm thông
tin công ty. Cần xoá gì hoặc đổi cấu hình chung thì nhờ Quản trị viên.

---

## 7. Việc không tự làm được, phải gọi dev

- Đổi domain (tên miền) website.
- Cài đặt HTTPS / chứng chỉ bảo mật.
- Khôi phục dữ liệu từ bản sao lưu (backup) khi có sự cố mất dữ liệu.
- Thêm tài khoản admin mới nếu bạn đang là Quản trị viên duy nhất và quên
  mật khẩu (chức năng "quên mật khẩu qua email" chưa bật ở bản này).
- Thêm ngôn ngữ mới, đổi cấu trúc menu, thêm loại nội dung mới (ví dụ thêm
  collection "Dự án", "Tuyển dụng"...).
- Đổi màu chủ đạo của toàn site (đây là màu lấy đúng từ logo — đổi ảnh hưởng
  toàn bộ nút và tiêu đề trên site, cần cân nhắc trước khi đổi).
- Bất kỳ lỗi hiển thị lạ, trang trắng, hoặc thông báo lỗi bằng tiếng Anh khi
  thao tác trong `/admin`.
