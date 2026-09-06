# Brief — review trang quản trị /admin (chuẩn senior/staff)

> Neo: nhánh `feat/tenant-tach-va-cay-dich-vu`, sau khi contract ADMIN land.
> Dev server chạy ở http://localhost:3000 · admin `admin@gmail.com` / `Admin@123`.

## Người dùng thật của trang này

**Nhân viên kế toán của khách, KHÔNG phải dev.** Đây là tiêu chí trung tâm: một thao tác
đòi hỏi hiểu Next.js/Payload mới làm đúng thì đó là lỗi thiết kế, không phải "user cần đào tạo".

Cùng codebase sẽ clone ra site thứ hai (HiTax) chỉ bằng đổi env `TENANT` — nên bất cứ chỗ nào
ghim cứng thương hiệu HiACC vào DB hoặc code là lỗi.

## HAI BẢNG, TÁCH BẠCH

### Bảng 1 — CHẶN BÀN GIAO
Bảo mật/phân quyền (nhân viên sửa được thứ không được phép?) · **mất dữ liệu khách** ·
thao tác sai làm hỏng site công khai mà admin không báo gì · trường bắt buộc mà không nhập nổi ·
mô tả hướng dẫn SAI SỰ THẬT (hứa một đằng làm một nẻo).

### Bảng 2 — NỢ KỸ THUẬT / UX
Nhãn khó hiểu, thứ tự field không theo luồng nhập, cột thừa/thiếu, thiếu hướng dẫn,
component admin viết cẩu thả. Không trộn vào bảng 1.

## 4 việc vừa làm — soi kỹ đúng những chỗ này

Contract: `runs/CONTRACT-admin.md` · fact sheet: `runs/FACTS-admin-refactor.md` (đã verify sẵn).

1. **`pages`** — user từng nghi là code cũ; đo thật thì KHÔNG (`/gioi-thieu` + `/lien-he` đọc nó
   qua `getPageBySlug`). Việc đã giao là *làm rõ mô tả*, không xoá.
   → Kiểm: mô tả mới có nói đúng sự thật không? Nhân viên đọc xong có hiểu tạo bản ghi mới
   KHÔNG tự sinh route không? Có vô tình chặn mất thao tác hợp lệ nào không?
2. **Cây dịch vụ dạng tree** — component admin ĐẦU TIÊN của repo (`src/components/admin/`).
   → Kiểm: cây hiện đúng cấu trúc cha-con thật trong DB? 37 node (5 nhóm/32 hạng mục) hiện đủ?
   `npm run generate:importmap` đã chạy chưa (thiếu là admin chết "Module not found" — đã từng
   làm chết build repo này)? Node không có cha, node bị xoá cha, cây sâu 3 tầng thì sao?
   Nếu có kéo-thả: hook chặn vòng lặp `ServiceNodes.ts:115-158` còn hiệu lực không, hay bị bypass?
3. **`LegalDocuments` + `Categories`** — rà nhãn/cột/mô tả/required/thứ tự field.
   → Kiểm: có ai lỡ đổi `value` của select không? (DB đang tham chiếu — đổi là mất dữ liệu khách.
   Đây là finding P0 nếu xảy ra.) Nhãn mới có dễ hiểu hơn thật không?
4. **Màu chủ đạo** — từ ô text gõ tay thành bảng màu + vẫn nhập được mã tuỳ ý (phải có CẢ HAI).
   → Kiểm: chọn màu trong admin xong thì site công khai ĐỔI MÀU THẬT không (đo HTML render,
   không đọc code)? Nhập mã lạ/sai định dạng thì sao? Có ai thêm `defaultValue` không (cấm —
   sẽ ghim đỏ HiACC vào DB HiTax)? `src/lib/brandStyle.ts` có bị sửa không (cấm)?

## Đã có người kiểm và BÁC BỎ — đừng kiểm lại

- `brandStyle.ts` regex hex **không thủng XSS** (đã test 4 payload). Chỉ thủng nếu ai thêm cờ `m`.
- Hook chặn vòng lặp cây dịch vụ **chặn được** (đã test 3 kịch bản trên DB thật): self-parent,
  A→B→A, và vòng 3 node. Guard ở `create` không phải lỗ hổng (lúc create chưa có id).
- Collection `services` (cũ, phẳng) đã `hidden: true` — đúng, không phải bỏ sót.

## Cách làm — bắt buộc

**Mọi finding phải tái hiện được**, ghi lệnh + output thật. Không tái hiện được → mục riêng
"nghi vấn chưa chứng minh".

Với admin, phần lớn phải đo bằng **Payload Local API trên DB thật** hoặc **HTML render**, không
chỉ đọc config: repo này đã dính hai lần "code trông đúng mà chạy sai" —
(a) field "Màu chủ đạo" từng KHÔNG có code nào đọc, mô tả hứa đổi màu toàn site mà sửa xong
không đổi gì; (b) grep source sạch nhưng trang vẫn hiện chuỗi cũ vì nội dung nằm trong DB.

Kịch bản nên thử ít nhất: đăng nhập admin · mở từng collection · tạo/sửa/xoá thử một bản ghi
rồi HOÀN NGUYÊN · đổi màu rồi xem site · xem cây dịch vụ · thử vai trò không phải admin nếu có.

## Ràng buộc

- **CHỈ ĐỌC code. Không sửa file nào.**
- Được ghi/xoá bản ghi thử trong DB để kiểm, nhưng **PHẢI hoàn nguyên** và nói rõ trong báo cáo
  đã tạo/xoá gì. Không đụng vào bản ghi có sẵn của khách.
- KHÔNG chạy `npm run seed`.
- Không sửa/xoá test.
