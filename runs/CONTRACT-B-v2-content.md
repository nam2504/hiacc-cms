# T-v2-content — Track B
read: src/collections/ServiceNodes.ts, src/collections/blocks.ts, src/seed/data.ts, hitax/REQUIREMENTS-hiacc-v2.md (mục 2, 6, phụ lục A)
facts:
  - Schema hạng mục dịch vụ đã là block/flexible content (`serviceBodyBlocks` trong blocks.ts):
    pricingTableBlock, bulletListBlock, fieldTableBlock, richTextBlock, ctaBlock — đủ để dựng mọi
    biến thể theo nhóm mô tả ở REQUIREMENTS mục 2. KHÔNG cần thêm block mới trừ khi thật sự thiếu.
  - ServiceNodes.ts field `title` đã `localized: true` sẵn — chỉ cần nhập bản dịch, không cần sửa schema.
  - `summary` (textarea) và `heroStats` (array) trong ServiceNodes cũng đã localized sẵn.
  - hook `beforeChange`/`beforeDelete` trong ServiceNodes.ts đã đầy đủ (chặn vòng lặp, chặn xoá còn con,
    chặn slug trùng RESERVED_ROOT_SLUGS) — KHÔNG cần sửa, không đụng vào phần hooks.
  - Quyết định đã chốt (REQUIREMENTS mục 10, câu 6): 30/32 hạng mục CHỈ cần title (VI/EN) + placeholder
    "Đang cập nhật" (phải dịch theo locale, không hardcode tiếng Việt — dùng cơ chế localized field, để
    trống bản EN sẽ tự fallback nên PHẢI điền tường minh cả 2 locale) cho 4 khối bắt buộc: bảng giá,
    nhiệm vụ HIACC, nhiệm vụ khách hàng, cam kết. 2 hạng mục demo (1 ở nhóm Kế toán, 1 ở nhóm khác —
    tự chọn, ví dụ "Kế toán trọn gói" và 1 hạng mục nhóm Thành lập) cần nội dung block đầy đủ, dịch cả
    VI/EN, theo đúng cấu trúc mô tả ở REQUIREMENTS mục 2 (không bịa thêm khối ngoài spec).
  - 5 nhóm/32 hạng mục cụ thể: xem bảng ở REQUIREMENTS mục 1 (KẾ TOÁN 7, THÀNH LẬP 5, THAY ĐỔI ĐKKD 9,
    GIẤY PHÉP HOẠT ĐỘNG 5, DỊCH VỤ KHÁC 6).
sở hữu: src/collections/ServiceNodes.ts, src/collections/blocks.ts, src/seed/data.ts
merge: (không chia sẻ file với track khác — không cần)
done when:
  type: executable
  cmd: |
    cd app && npx tsc --noEmit && npm test
    # + verify thủ công: chạy seed, đếm số node service-nodes phải = 37 (5 nhóm + 32 hạng mục),
    #   query 2 node demo phải có body blocks non-empty ở CẢ locale=vi và locale=en,
    #   30 node còn lại title non-empty ở cả 2 locale.
invariants:
  - source of truth cho nội dung 32 hạng mục: seed/data.ts (giống các collection khác trong repo)
  - không hardcode chuỗi "Đang cập nhật" trực tiếp trong component — phải qua field localized thật
    (nếu cần chuỗi UI dùng chung, kiểm xem đã có key i18n nào tương ứng trong lib/i18n.ts chưa,
    báo lại nếu chưa có thay vì tự thêm hệ thống i18n mới)
budget: dừng nếu phải sửa hook beforeChange/beforeDelete (ngoài scope) hoặc phải đổi schema block hiện có — báo BLOCKED, không tự quyết
on-budget: DỪNG. Ghi checkpoint vào runs/CHECKPOINT-B.md. Trả state BUDGET.
verify: self
