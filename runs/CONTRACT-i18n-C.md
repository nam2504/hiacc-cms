# C — Trang nội dung + 4 client component

read:   runs/FACTS-i18n-locale.md · app/src/lib/i18n.ts · app/src/lib/requestLocale.ts · app/src/components/layout/MegaMenu.tsx
facts:  runs/FACTS-i18n-locale.md   ← ĐỌC TRƯỚC. Đã verify sẵn, KHÔNG kiểm lại.

sở hữu:
  app/src/app/(site)/lien-he/page.tsx
  app/src/app/(site)/gioi-thieu/page.tsx
  app/src/app/(site)/not-found.tsx
  app/src/app/(site)/cong-cu/tinh-luong/page.tsx
  app/src/components/pages/ContactInfo.tsx
  app/src/components/pages/BranchList.tsx
  app/src/components/pages/PageBody.tsx
  app/src/components/payroll/PayrollCalculator.tsx     ← CLIENT
  app/src/components/contact/ContactForm.tsx           ← CLIENT
  app/src/components/map/BranchMap.tsx                 ← CLIENT
  app/src/components/layout/LanguageSwitcher.tsx       ← CLIENT
  app/src/lib/i18n.ts      :: CHỈ được THÊM khoá mới có tiền tố `pages.` và `payroll.`
  app/src/lib/i18n.en.ts   :: đối ứng

merge: ORCHESTRATOR

## Việc
Phần khó nhất của wave: 4 CLIENT component (`'use client'` ở dòng 1).
Client KHÔNG gọi được `getRequestLocale()` (nó dùng `headers()`, chỉ chạy phía server).
→ nhận `locale` qua props từ cha (là server component), rồi `createTranslator(locale)` trong thân hàm.
Mẫu sống: `src/components/layout/MegaMenu.tsx:41`. Cha phải truyền xuống — cha nào nằm trong
`sở hữu` của bạn thì sửa luôn; cha nằm ngoài thì đó là BUDGET, báo lại.

`PayrollCalculator.tsx` có 55 lời gọi `t(` — nhiều nhất wave. Đừng vội; nó là công cụ tính tiền
lương cho khách hàng cuối, sai chuỗi nhãn thì người dùng đọc nhầm con số.
⚠️ CHỈ đổi cách lấy translator. KHÔNG động vào công thức tính, hằng số thuế, hay `parseInput.ts`.

`not-found.tsx` là trang 404 — nó có thể không có request context như trang thường; kiểm thực tế
trước khi kết luận, đừng giả định.

done when:
  type: executable
  cmd:  cd ~/Documents/project/hiacc-cms && ./runs/verify-i18n.sh pages

verify: self
invariants: → runs/FACTS-i18n-locale.md §"Ràng buộc"
budget: dừng nếu phải sửa file ngoài `sở hữu` (đặc biệt: component cha của client component)
        → ghi runs/CHECKPOINT-C.md, trả BUDGET.
on-budget: DỪNG. Ghi checkpoint. Trả BUDGET. KHÔNG báo xanh.

Report: file đã đổi + khoá i18n đã thêm + output done-when + nói rõ cha nào phải truyền props locale.
KHÔNG dump file.
