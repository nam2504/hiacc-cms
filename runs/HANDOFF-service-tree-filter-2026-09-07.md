# Handoff: cây dịch vụ admin xổ/thu + click lọc bảng

## Mục tiêu
Verify tính năng vừa deploy (commit `93a7b5d`, đã push + `flyctl deploy` staging
thành công) hoạt động đúng trên **staging thật** — mới verify ở local, chưa
verify trên `hiacc-cms-staging.fly.dev`.

## Đã xác định (kết luận, KHÔNG phải code)
- Tính năng: `/admin/collections/service-nodes` — cây dịch vụ có mũi tên xổ/thu
  từng nhóm cha, click 1 node (cha hoặc con) lọc bảng Payload bên dưới còn
  đúng 1 dòng, có nút "Bỏ lọc". Neo: `app/src/components/admin/ServiceTreeInteractive.tsx`,
  gọi từ `app/src/components/admin/ServiceTree.tsx:~150` (`walk()` build
  `nodes`/`childrenOfPlain` truyền props).
- **Root cause 1 bug đã sửa trong lúc code (không phải bug user báo)**: lúc đầu
  tự `router.push`/`replace` đổi `where[id][equals]` trên URL — bấm "Bỏ lọc"
  thì bảng lọc đúng (network request đúng, về 10 dòng) nhưng URL "nảy" lại về
  có `where` cũ, chỉ lộ khi đo đủ 2 bước liên tiếp (chọn → bỏ lọc), không thấy
  nếu chỉ test 1 bước. Nguyên nhân: Payload's `ListQueryProvider`
  (`node_modules/@payloadcms/ui/dist/providers/ListQuery/index.js:114-136`)
  giữ `query` state RIÊNG, chỉ đồng bộ MỘT CHIỀU ra URL, không đọc URL ngược
  lại. Fix đúng: dùng `useListQuery().handleWhereChange()` — API công khai
  của Payload — thay vì tự đổi URL. Đã verify PASS 2 lần liên tiếp (2 node
  khác nhau) trên browser thật LOCAL. tsc sạch, 81/81 test.
- Trước đó cùng session đã sửa xong bug khác (đã verify cả local lẫn staging,
  không cần verify lại): chuyển locale VI/EN kẹt URL — commit `b1a535b`, xem
  `WS-6-hiacc-cms.md` dòng update khuya-13/14.
- Tài khoản test local đã tạo: `admin@local.test` / `LocalTest123!` (DB local
  `app/hiacc.db`, gitignored, không lẫn vào git). Account staging xem log cũ
  T-g3: `admin@gmail.com` / `Admin@123` (không chắc còn đúng, staging DB có thể
  đã seed lại).

## Chưa biết / câu hỏi mở
- Chưa verify trên staging thật (`https://hiacc-cms-staging.fly.dev/admin/collections/service-nodes`)
  — chỉ mới verify ở dev server local (`localhost:3000`).

## Bước tiếp theo
1. Đăng nhập `https://hiacc-cms-staging.fly.dev/admin` (thử creds cũ ở trên,
   nếu sai thì tạo user mới qua UI — chú ý bug phụ đã gặp: form "create-first-user"
   cần điền field "Họ tên", không có nó API trả 400 âm thầm không hiện lỗi rõ
   trên form).
2. Vào `/admin/collections/service-nodes`, lặp lại đúng kịch bản đã PASS ở
   local: click 1 node bất kỳ (vd "Quyết toán thuế") → xác nhận bảng còn 1
   dòng + URL có `where[id][equals]=<id>` → bấm "Bỏ lọc" → xác nhận
   `location.href` (đọc bằng JS trực tiếp, không tin `tabs_context_mcp` hiển
   thị vì có thể cache) KHÔNG còn `where`, bảng về đủ dòng.
3. Nếu PASS: cập nhật `WS-6-hiacc-cms.md` xác nhận đã verify staging, coi
   task này DONE. Nếu FAIL: đọc lại đoạn root cause ở trên trước khi đoán tiếp
   — đừng lặp lại việc tự thao túng URL.
