# Handoff: Redesign HiACC v2 — build song song 32 hạng mục + CTA đỏ

## ✅ ĐÃ ĐÓNG 07/09 khuya — cả 2 track xong, bug đã sửa và verify thật
Xem WS-6 dòng `> updated: khuya-8`. Root cause bug mất locale VI: field `blocks` không
`localized` ở cấp cha, Payload phân biệt dòng theo `id` ở MỌI cấp lồng nhau (kể cả
`rows`/`items` bên trong block) — gán mảng mới không `id` = ghi đè toàn bộ, mất locale
cũ. Fix: `mergeBlockKeepingIds()` trong `app/src/seed/serviceTreeEn.ts`. Verify bằng xoá
DB thật + seed lại + query SQL trực tiếp (không chỉ tin log) — khớp 4/4, 17/17, 5/5 giữa
vi/en, tsc sạch, 81/81 test. File giữ lại để tham khảo lịch sử điều tra bên dưới.

## Mục tiêu
Build theo 6 quyết định đã chốt với khách 07/09 (`hitax/REQUIREMENTS-hiacc-v2.md` mục 10):
sitemap thay hoàn toàn `/dich-vu` cũ, dải đỏ CTA theo mockup mới, 32 hạng mục (30 title-only
+ 2 demo đầy đủ), tất cả VI/EN. Đã dispatch 2 agent song song (Track B = nội dung 32 hạng
mục, Track A+C = CTA đỏ + xác nhận sitemap/bảng giá).

## Đã xác định (kết luận, KHÔNG phải code)
- Contract ban đầu của Track B SAI 1 fact: nội dung 32 hạng mục KHÔNG nằm ở `seed/data.ts`
  (đó chỉ chứa `SERVICES` — 7 mục, collection `services` cũ, khác `service-nodes`) — nằm ở
  `app/src/seed/serviceTree.ts` + `serviceContent.ts` + `serviceTreeEn.ts`, do một đợt làm
  TRƯỚC đó đã dựng sẵn 37 node (5 nhóm + 32 hạng mục). Track B (BLOCKED) không sửa gì trong
  3 file được giao vì đúng — không cần thêm nội dung trùng.
- **Bug thật đã tìm ra**: 2 node demo (`ke-toan-tron-goi`, `thay-doi-ten`) mất toàn bộ block
  content (bảng giá/nhiệm vụ/cam kết) ở locale `vi` trong DB sau khi chạy `npm run seed` —
  chỉ còn tồn tại ở locale `en`. Nghi vấn cơ chế: `serviceTreeEn.ts` gọi
  `payload.update({ ..., locale: 'en', data: { body } })` để ghi bản EN, và việc này có vẻ
  ghi đè/xoá mất các dòng locale `vi` đã seed trước đó trong bảng con
  (`service_nodes_blocks_*_locales`) — do field localized nằm LỒNG bên trong `blocks` array
  không-localized. Bảng `service_nodes_blocks_field_table_locales` rỗng hoàn toàn cả 2 locale.
  Verify bằng: `npm run seed` rồi query trực tiếp `hiacc.db` — neo: `app/src/seed/serviceTreeEn.ts`,
  `app/src/collections/blocks.ts` (nghi vấn, chưa xác nhận có phải nguồn lỗi).
- Bug phụ: `serviceTreeEn.ts::ITEMS` thiếu field `summary` cho node demo `ke-toan-tron-goi`
  → rơi vào nhánh mặc định `PENDING_EN` ("Detailed content is being updated.") thay vì bản
  dịch thật — vì code không phân biệt "node demo cần nội dung đầy đủ" với "30 node còn lại
  chỉ cần placeholder".
- Track A+C (CTA đỏ + xác nhận sitemap/bảng giá) — **chưa nhận được kết quả**, agent vẫn
  đang chạy hoặc chưa có thông báo hoàn thành tại thời điểm ghi handoff này.
- Chi tiết đầy đủ (bảng SQL, số dòng, lý do không tự sửa): `~/Documents/project/hiacc-cms/runs/CHECKPOINT-B.md`.
- Contract gốc: `~/Documents/project/hiacc-cms/runs/CONTRACT-B-v2-content.md` và
  `~/Documents/project/hiacc-cms/runs/CONTRACT-AC-v2-cta-sitemap.md`.
- WS-6 đã ghi log dispatch 2 track ở dòng `> updated: 2026-09-07 khuya-6` trong
  `~/Documents/project/workstreams/WS-6-hiacc-cms.md`.

## Chưa biết / câu hỏi mở
- Nguyên nhân gốc mất locale `vi`: bug ở cách gọi `payload.update` trong `serviceTreeEn.ts`
  (sửa được, ngoài sở hữu Track B), hay ở cách `blocks.ts` khai báo field localized lồng
  trong block (trong sở hữu Track B, nhưng đổi schema là vượt budget đã cấm)? Chưa xác nhận.
- Track A+C: PASS/FAIL/BUDGET/BLOCKED gì — chưa có thông báo tại thời điểm này. Cần kiểm
  `ListAgents`/chờ notification khi phiên tiếp theo bắt đầu.
- Có cần cập nhật lại `CONTRACT-B-v2-content.md` (fact sai về `seed/data.ts`) trước khi giao
  tiếp việc sửa bug locale cho ai đó không.

## Bước tiếp theo
1. Kiểm trạng thái Track A+C (agent id `acb87724ab9911159` — dùng `ListAgents` hoặc chờ
   notification) trước khi làm gì khác.
2. Điều tra bug mất locale `vi` trong `serviceTreeEn.ts` — đọc kỹ đoạn gọi `payload.update`
   ghi field `body` (blocks) với `locale: 'en'`, so sánh hành vi Payload giữa update
   toàn bộ document theo locale vs. merge từng field localized lồng trong block.
3. Sửa `serviceTreeEn.ts::ITEMS` để thêm `summary` tiếng Anh thật cho 2 node demo, tránh
   rơi vào `PENDING_EN`.
4. Sau khi 2 bug trên được xử lý, chạy lại `npm run seed` + query DB xác nhận cả 2 locale
   đều có block content, rồi mới coi T-v2-content là xong — cập nhật WS-6.
5. Không tự ý push git 15+ commit hiện có trên nhánh `feat/tenant-tach-va-cay-dich-vu`
   (đã ahead 15 so với remote từ trước) cho tới khi bug này được xử lý xong.
