# ADMIN — refactor trang quản trị (4 việc user yêu cầu)

read:   runs/FACTS-admin-refactor.md · app/src/collections/ · app/src/globals/Settings.ts
facts:  runs/FACTS-admin-refactor.md   ← ĐỌC TRƯỚC. Đã verify sẵn, KHÔNG kiểm lại.

sở hữu (chỉ được GHI vào đây):
  app/src/collections/ServiceNodes.ts
  app/src/collections/LegalDocuments.ts
  app/src/collections/Categories.ts
  app/src/collections/Pages.ts
  app/src/globals/Settings.ts
  app/src/components/admin/**          ← thư mục MỚI, bạn tạo
  app/src/app/(payload)/admin/importMap.js   ← chỉ qua `npm run generate:importmap`, ĐỪNG sửa tay

merge: — (không chia sẻ file với ai; wave i18n đã land ở commit 67c4702)

## 4 việc

### 1. `pages` — làm rõ, KHÔNG xoá
User nghi đây là code cũ. Fact sheet đã chứng minh NGƯỢC LẠI: `/gioi-thieu` và `/lien-he`
đang đọc nó. Xoá = 2 trang mất nội dung.
Việc thật: `pages` chỉ phục vụ đúng 2 trang cố định nhưng admin hiện nó như collection tự do,
nhân viên tưởng tạo trang mới là site có route mới (KHÔNG — route là file tĩnh trong Next).
→ Sửa `admin.description` nói rõ điều đó, và `admin.defaultColumns` cho thấy slug.
→ Cân nhắc `admin.group` tách khỏi 'Nội dung' nếu bạn thấy hợp lý (tự quyết).
KHÔNG xoá collection, KHÔNG đổi slug, KHÔNG chặn tạo mới (khách có thể cần trang thứ 3 sau này
— lúc đó dev thêm route; mô tả phải nói rõ ràng buộc này).

### 2. Cây dịch vụ hiện dạng TREE
Hiện là bảng phẳng 37 dòng (5 nhóm + 32 hạng mục). Payload 3.88 không có view cây sẵn.
→ Viết component admin tuỳ biến hiện cấu trúc cha-con thụt lề, thay cho (hoặc bổ sung) bảng phẳng.
Cách nối: `admin.components` trong `ServiceNodes.ts`. Đây là component admin ĐẦU TIÊN của repo.
⚠️ BẮT BUỘC chạy `npm run generate:importmap` sau khi thêm, nếu không admin chết
"Module not found" (đã từng làm chết build — xem HANDOFF.md P0-1).
Phạm vi tối thiểu chấp nhận được: **xem** được cây trực quan. Kéo-thả KHÔNG bắt buộc
(WS-6/T-tree-ui ước ~0.5 ngày cho việc đó) — nếu làm thì phải giữ hook chặn vòng lặp
`ServiceNodes.ts:115-158` hoạt động, đừng bypass nó.

### 3. Rà soát Văn bản pháp luật / Chuyên mục
Đọc `LegalDocuments.ts` (7 nhóm select hardcode) và `Categories.ts` (2 nhóm select hardcode).
Rà: nhãn field có dễ hiểu với nhân viên không · `defaultColumns` có cột nào thừa/thiếu ·
`admin.description` có giải thích đủ để nhập liệu không cần hỏi lại không · required/optional
có hợp lý không · thứ tự field có theo luồng nhập tự nhiên không.
⚠️ AI-02: KHÔNG đổi/xoá `value` của select (DB đang tham chiếu — đổi là mất dữ liệu khách).
Nhãn (`label`) sửa được. Thêm option mới được.
Phát hiện gì không sửa được trong phạm vi (vd. finding i18n ở trang render `/van-ban-phap-luat`)
thì GHI VÀO REPORT, đừng lan sang file ngoài `sở hữu`.

### 4. Chọn màu bằng bảng màu thay vì gõ tay
`Settings.ts:62-73` field `primaryColor` là `type: 'text'` — nhân viên tự gõ `#RRGGBB`,
gõ sai thì im lặng rơi về màu tenant.
→ Cho chọn từ bảng màu gợi ý, VÀ vẫn nhập được mã tuỳ ý (user nói rõ: "select từ bảng màu
+ option fill mã màu" — phải có CẢ HAI, không thay thế nhau).
`#CC1420` (đỏ logo HiACC) nên là mục đầu bảng.
⚠️ KHÔNG thêm `defaultValue` cho field này — bỏ trống có nghĩa "dùng màu tenant", đặt cứng
sẽ ghim màu HiACC vào DB của HiTax (comment tại chỗ đã giải thích).
⚠️ KHÔNG sửa `src/lib/brandStyle.ts` — nó đã verify đúng, gồm cả regex chống XSS.
Giá trị lưu xuống DB phải giữ định dạng `#RRGGBB` hoặc `#RGB` để `brandStyle` đọc được.

done when:
  type: executable
  cmd:  cd ~/Documents/project/hiacc-cms && ./runs/verify-admin.sh
  (script kiểm: pages còn sống + 2 trang có nội dung · component admin đã nối + importMap đã sinh
   · slug/select value không bị phá · primaryColor không defaultValue · brandStyle nguyên vẹn
   · /admin sống · tsc sạch)

verify: self
invariants: → runs/FACTS-admin-refactor.md §"Ràng buộc"
budget: phải sửa file ngoài `sở hữu` → ghi runs/CHECKPOINT-ADMIN.md, trả BUDGET.
on-budget: DỪNG. Ghi checkpoint. Trả BUDGET. KHÔNG báo xanh.

Report: state · file đã đổi · component admin đã tạo · những gì rà soát được ở việc 3
(kể cả thứ CỐ Ý không sửa và vì sao) · output đầy đủ done-when · ảnh/mô tả cây hiện ra sao.
KHÔNG dump nội dung file.
