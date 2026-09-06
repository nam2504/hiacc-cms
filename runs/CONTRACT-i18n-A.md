# A — Khung site (layout, home, services)

read:   runs/FACTS-i18n-locale.md · app/src/lib/i18n.ts · app/src/lib/requestLocale.ts · app/src/components/layout/Header.tsx
facts:  runs/FACTS-i18n-locale.md   ← ĐỌC TRƯỚC. Đã verify sẵn, KHÔNG kiểm lại.

sở hữu (chỉ được GHI vào đây):
  app/src/components/layout/Footer.tsx
  app/src/components/layout/TopBar.tsx
  app/src/components/layout/Header.tsx
  app/src/components/home/Social.tsx
  app/src/components/home/Branches.tsx
  app/src/components/home/About.tsx
  app/src/components/home/Knowledge.tsx
  app/src/components/home/Stats.tsx
  app/src/components/home/CallToAction.tsx
  app/src/components/home/ServiceGroups.tsx
  app/src/components/services/ServiceSidebar.tsx
  app/src/components/services/ServiceBody.tsx
  app/src/app/(site)/page.tsx
  app/src/lib/i18n.ts      :: CHỈ được THÊM khoá mới có tiền tố `services.` và `home.services.`
  app/src/lib/i18n.en.ts   :: đối ứng, cùng tiền tố

merge: ORCHESTRATOR   # i18n.ts + i18n.en.ts chia sẻ với B và C — mỗi bên một tiền tố khoá riêng

## Việc
Bỏ `t` (translator đóng băng) trong các file thuộc `sở hữu`, thay bằng mẫu đúng ở fact sheet §"Mẫu ĐÚNG".
Tất cả đều là server component → `getRequestLocale()` + `createTranslator(locale)`.

Kèm 6 chuỗi cứng ở fact sheet §"Chuỗi cứng" thuộc phạm vi này:
ServiceSidebar.tsx:32,33 · ServiceBody.tsx:34 · ServiceGroups.tsx:29,32 · Header.tsx:45.
Thêm khoá mới vào CẢ HAI từ điển, chỉ dùng tiền tố `services.` / `home.services.` (tránh đụng B, C).
`Header.tsx:45` truyền `ctaLabel` xuống `MegaMenu` — Header đã có `tr` sẵn ở dòng 33, dùng nó.

⚠️ ĐỪNG sửa nút chuyển ngôn ngữ ở `MegaMenu.tsx:180` (fact sheet đã ghi: nó ĐÚNG). MegaMenu không thuộc sở hữu của bạn.

done when:
  type: executable
  cmd:  cd ~/Documents/project/hiacc-cms && ./runs/verify-i18n.sh layout
  (dev server phải đang chạy; curl thử http://localhost:3000/ trước, chỉ bật `npm run dev` nếu chưa sống)

verify: self
invariants: → runs/FACTS-i18n-locale.md §"Ràng buộc"
budget: dừng nếu phải sửa file ngoài `sở hữu` → ghi runs/CHECKPOINT-A.md, trả state BUDGET, KHÔNG tự sửa lan.
on-budget: DỪNG. Ghi checkpoint. Trả BUDGET. KHÔNG báo xanh.

Report: liệt kê file đã đổi + khoá i18n đã thêm + output đầy đủ của done-when. KHÔNG dump nội dung file.
