# B — Tin tức & chuyên mục

read:   runs/FACTS-i18n-locale.md · app/src/lib/i18n.ts · app/src/lib/requestLocale.ts · app/src/app/(site)/layout.tsx
facts:  runs/FACTS-i18n-locale.md   ← ĐỌC TRƯỚC. Đã verify sẵn, KHÔNG kiểm lại.

sở hữu:
  app/src/app/(site)/tin-tuc/page.tsx
  app/src/app/(site)/tin-tuc/[slug]/page.tsx
  app/src/app/(site)/chuyen-muc/page.tsx
  app/src/app/(site)/chuyen-muc/[slug]/page.tsx
  app/src/components/news/Pagination.tsx
  app/src/components/news/PostArticle.tsx
  app/src/components/news/PageHero.tsx
  app/src/components/news/PostCard.tsx
  app/src/components/news/EmptyState.tsx
  app/src/components/news/CategoryGroups.tsx
  app/src/components/seo/JsonLd.tsx
  app/src/lib/i18n.ts      :: CHỈ được THÊM khoá mới có tiền tố `news.`
  app/src/lib/i18n.en.ts   :: đối ứng

merge: ORCHESTRATOR

## Việc
Bỏ `t` đóng băng trong các file thuộc `sở hữu`, dùng mẫu đúng ở fact sheet.
Tất cả là server component → `getRequestLocale()` + `createTranslator(locale)`.
`PostCard.tsx` / `EmptyState.tsx` / `Pagination.tsx` là component con — nếu chúng được gọi từ
component cha đã có `locale`, ưu tiên nhận qua props thay vì mỗi con tự gọi `getRequestLocale()`
(giảm số lần đọc headers). Tự quyết, miễn done-when xanh.

`JsonLd.tsx` sinh structured data cho SEO — chuỗi ở đây cũng phải theo locale của trang.

done when:
  type: executable
  cmd:  cd ~/Documents/project/hiacc-cms && ./runs/verify-i18n.sh news

verify: self
invariants: → runs/FACTS-i18n-locale.md §"Ràng buộc"
budget: dừng nếu phải sửa file ngoài `sở hữu` → ghi runs/CHECKPOINT-B.md, trả BUDGET.
on-budget: DỪNG. Ghi checkpoint. Trả BUDGET. KHÔNG báo xanh.

Report: file đã đổi + khoá i18n đã thêm + output done-when. KHÔNG dump file.
