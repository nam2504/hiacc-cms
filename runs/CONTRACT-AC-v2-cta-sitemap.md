# T-v2-cta-sitemap — Track A+C (gộp)
read: src/globals/Settings.ts, src/app/(site)/sitemap.ts, "src/app/(site)/bang-gia/page.tsx", "src/app/(site)/tin-tuc/page.tsx", src/lib/i18n.ts, hitax/REQUIREMENTS-hiacc-v2.md (mục 3, 5, 10)
facts:
  - Route `/dich-vu/[slug]` cũ KHÔNG còn tồn tại trong filesystem (đã verify bằng `find`) — sitemap.ts
    dòng comment xác nhận "Nhánh /dich-vu/<slug> cũ đã BỎ khỏi sitemap". Việc "xoá route cũ" (câu 2
    mục 10) ĐÃ XONG từ trước — chỉ cần xác nhận lại bằng curl, KHÔNG sửa code sitemap.ts hay routing.
  - `/bang-gia` (src/app/(site)/bang-gia/page.tsx) ĐÃ là trang placeholder chuẩn: dùng
    t('pricing.pending.title')/t('pricing.pending.body') qua EmptyState component, localized đúng
    cả VI/EN sẵn. Việc "để nội dung Đang cập nhật" (câu 5 mục 10) ĐÃ XONG cho Bảng giá — không sửa.
  - `/tin-tuc` (src/app/(site)/tin-tuc/page.tsx) là danh sách bài viết thật (query getPosts), tự hiện
    empty-state khi rỗng — không cần placeholder tĩnh, đây là thiết kế đúng, không phải bug.
  - Global Settings.ts hiện có `home.stats` (3 ô value/label, "Dải cam kết") — đây KHÔNG PHẢI dải đỏ
    CTA full-width theo mockup mới (REQUIREMENTS mục 3 + Phụ lục A3: nền #CC1420 full-width, chữ
    trắng, 2 nút "Đăng ký tư vấn" + "Bảng giá tổng hợp"). Đây là field MỚI cần thêm, không tái dùng stats.
  - Việc còn lại DUY NHẤT của track này: thêm 1 group field mới vào Settings.ts (trong tab "Trang chủ",
    cạnh group `home`) cho CTA đỏ: tiêu đề (localized text) + 2 nút, mỗi nút có label (localized text)
    + href (text, không cần localized — URL thường giống nhau 2 locale). Theo đúng pattern field khác
    trong Settings.ts (xem heroCta/heroCtaSecondary dòng ~221-236 làm mẫu cấu trúc).
  - Component hiển thị dải đỏ CTA trên trang chủ (đọc field mới từ Settings, render nếu có) — kiểm xem
    trang chủ (src/app/(site)/page.tsx) đã có chỗ nào từng render dải đỏ CTA trước khi bị bỏ theo quyết
    định V3 (31/08) không; nếu còn component cũ đã comment/xoá một phần thì khôi phục theo field mới,
    nếu không có gì thì tạo component nhỏ mới (nằm cạnh các block hiện có của trang chủ).
sở hữu: src/globals/Settings.ts, trang chủ src/app/(site)/page.tsx (chỉ phần render CTA đỏ, không đụng phần khác), component CTA đỏ mới nếu cần tạo (đặt cạnh các component trang chủ hiện có, ví dụ src/components/home/)
merge: (không chia sẻ file với Track B — ServiceNodes/blocks/seed không đụng tới)
done when:
  type: executable
  cmd: |
    cd app && npx tsc --noEmit && npm test
    curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/dich-vu/ke-toan-tron-goi  # phải 404
    curl -s http://localhost:3000/sitemap.xml | grep -c '/dich-vu/'                           # phải 0
    curl -s http://localhost:3000/bang-gia | grep -c 'Đang cập nhật\|pending'                 # phải > 0
    curl -s http://localhost:3000/ | grep -c 'CC1420\|cta-đỏ-class-thật'                       # dải CTA phải render
    # + xác nhận field CTA mới hiển thị đúng khi đổi locale=en trong /admin
invariants:
  - source of truth cho brand/màu: src/config/tenant.ts — không hardcode #CC1420 lần 2 ở component mới,
    dùng lại token màu đã có (TENANT.colors.brand) như các component khác trong repo
  - dải đỏ CTA là field MỚI, không phải bật lại field cũ đã bị Payload migration xoá — nếu grep thấy
    field CTA cũ còn sót trong migration cũ, đó là dữ liệu lịch sử, không cần touch
budget: dừng nếu phát hiện route /dich-vu vẫn còn sống ở đâu đó (mâu thuẫn với facts) — báo BLOCKED ngay, đừng tự sửa thêm ngoài field CTA
on-budget: DỪNG. Ghi checkpoint vào runs/CHECKPOINT-AC.md. Trả state BUDGET.
verify: self
