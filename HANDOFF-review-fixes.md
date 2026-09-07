# Handoff: đóng finding review site HiACC (đợt 07/09)

## Trạng thái: 3/3 reviewer đã chạy, 7 nhóm finding chặn bàn giao ĐÃ ĐÓNG

Nhánh `feat/tenant-tach-va-cay-dich-vu`, HEAD `e492eac`. Dev server `localhost:3000`,
admin `admin@gmail.com` / `Admin@123`. Cây làm việc sạch.

| Commit | Nội dung |
|---|---|
| `670f725` … `a958ce2` | đợt 1 — xem mục "đã xác định" bên dưới |
| `7c768d5` | `TopBar.tsx` dùng class `.links` không tồn tại → 4 link dính liền |
| `86c7b4d` | handoff đợt 1 |
| `be670ba` | **mega-menu không bao giờ mở** — `transition: visibility` + neo panel + export class |
| `732695b` | **chặn đường xoá** — 3 hook `beforeDelete` (service-nodes, Pages, Categories) + `en` vào slug cấm |
| `e492eac` | **validate slug** — chặn tiếng Việt có dấu, chữ hoa, khoảng trắng, `/` |

## Gate (đã chạy sau khi sửa, đều xanh)
```
cd app && npx tsc --noEmit          # rc=0
cd app && npm test                  # 81 pass, 0 fail
bash runs/verify-admin.sh           # PASS
bash runs/verify-i18n.sh all        # PASS, từ điển 214/214
# 10/10 route trả 200: / /en /gioi-thieu /lien-he /tin-tuc /chuyen-muc
#                      /van-ban-phap-luat /ke-toan /cong-cu/tinh-luong /bang-gia
```

---

## ⚠️ ĐỌC TRƯỚC KHI ĐỘNG VÀO QUYỀN XOÁ

**`access.delete` KHÔNG chặn được xoá.** Local API (`payload run`, seed, mọi script)
mặc định `overrideAccess: true` nên đi thẳng qua `access`. Chỉ hook `beforeDelete` mới
luôn chạy.

Tôi học điều này bằng cách **tự xoá mất trang `/lien-he`** khi test `delete: () => false`.
`versions: { drafts: true }` KHÔNG cứu được — Payload xoá luôn version. Phải khôi phục
thủ công từ `app/src/seed/data.ts` (`PAGES`, slug `lien-he`), tạo lại đúng 1 bản ghi
bằng `payload.create` — **không** chạy `npm run seed` (nó reset cả DB).

Hệ quả cho người sau: muốn chặn xoá ở bất kỳ collection nào, viết hook, đừng viết access.

---

## Phát hiện xuyên suốt của cả đợt review

**Repo canh đường GHI rất kỹ, không canh đường XOÁ ở đâu cả.**
Đường ghi có 2 hook (chặn vòng lặp, chặn slug trùng route) + validate trùng slug.
Đường xoá trước đợt này: trống trơn. Hai reviewer độc lập, cold-start, cùng chỉ vào đó.

Khi xoá node cha, SQLite set `parent = NULL` cho các con → chúng lặng lẽ thành nhóm
cấp cao nhất, nhảy lên menu chính, **đổi URL công khai**, URL cũ 404. Không màn hình
xác nhận nào nói "nhóm này đang có 7 hạng mục con".

## Bài học phương pháp (3 cái, đều trả giá thật)

1. **`curl` bỏ lọt cả một lớp lỗi.** HTML đúng mà trang vẫn hỏng: `.links` thiếu ở
   TopBar (`7c768d5`), mega-menu không mở (`be670ba`). Cả hai chỉ lộ trên trình duyệt thật.
2. **Đoán nguyên nhân là đắt.** Mega-menu: tôi chẩn đoán sai 2 lần (đoán neo `position`,
   rồi đoán `styles.panelOpen` undefined) trước khi đo ra thủ phạm thật. Cách tìm ra:
   đặt `transition: none` rồi xem panel có hiện không — thí nghiệm phân biệt, không phải đọc code.
3. **`visibility` là thuộc tính RỜI RẠC.** Cho nó vào `transition` thì trình duyệt giữ
   nguyên `hidden` suốt thời gian transition rồi mới nhảy — panel không bao giờ mở.
   `opacity`/`transform` transition được, `visibility` thì không.

## Đã xác định (kết luận, đừng kiểm lại)

- **Wave i18n từng báo PASS là SAI** — `Hero.tsx` vẫn import `t` đóng băng; 2 check
  trong script verify grep chuỗi KHÔNG hề render nên luôn xanh. Nay mọi check đều
  mutation-test. Neo: `runs/verify-i18n.sh:25,30`
- **Link nội bộ**: 38 → 1 trên `/en`. Số 1 còn lại là `href="/"` — nút chuyển sang bản VI,
  **đúng thiết kế, đừng "sửa"**.
- **`NEXT_PUBLIC_SITE_URL` bị nướng cứng lúc `next build`** — set lúc `next start` là muộn.
  Nay `console.error` khi production thiếu biến. Neo: `app/src/lib/seo.ts:11`
- **Branding tenant**: `tenant.ts` là nguồn chân lý duy nhất; client component nhận màu
  qua `clientProps` của Payload, KHÔNG qua `NEXT_PUBLIC_*`.
- **BÁC BỎ P0 payroll**: "Lương Gross cần thoả thuận" nằm trong `.srOnly` — reviewer đọc
  DOM nên thấy node dành cho screen reader, mắt không thấy. 81/81 test pass.
- **`'bang-gia'` trong `RESERVED_ROOT_SLUGS`** là danh sách slug CẤM, không phải link chết.
- **`styles.col` thừa ở `Footer.tsx:47`** — `.grid` đã lo hết bố cục. Rác vô hại, cố ý
  không dọn (AI-01).
- **11 chuỗi tiếng Việt trên `/en` KHÔNG phải bug** — nội dung DB khách chưa dịch.
  Admin ĐÃ có chỗ nhập bản EN (`/admin/globals/settings?locale=en`, có nút "Copy to locale").
  Việc còn lại là khách nhập, không phải việc code.
- **Hydration error `data-gr-*`** = Grammarly tiêm vào `<body>`. Không phải bug.
- **Cookie `NEXT_LOCALE` làm lệch phép đo** — gõ `/` mà Chrome nhảy `/en`. Test tay phải
  set cookie tường minh.
- **Phân quyền `editor` chặt** (đã test bằng user thật): xoá → 403, sửa Settings → 403,
  tự nâng role → 403, đọc `/api/users` chỉ trả về chính mình.
- **Công cụ tính lương đúng tới từng đồng** — kiểm tay cả hai chiều, khứ hồi khớp tuyệt đối.
  Đây là chỗ rủi ro nhất (tính tiền cho khách hàng cuối) và nó đạt.

---

## Bước tiếp theo (chưa làm)

1. **Đo responsive 360 / 768 / 1440** — CHƯA AI ĐO. `resize_window` báo thành công nhưng
   `innerWidth` vẫn 1854; reviewer khai không đo được thay vì bịa số. Cần đo tay hoặc máy khác.
   Mega-menu vừa sửa mới chỉ verify ở desktop (1854px) — **phải kiểm cả mobile**.
2. **N1 · chuyển ngôn ngữ đổi URL mà không đổi nội dung**: bấm EN/VI thì URL đúng nhưng
   `<html lang>`, H1, `<title>` giữ nguyên bản cũ; tải thẳng URL thì đúng ⇒ client-side nav
   không render lại theo locale.
3. **N4 · form liên hệ gửi xong khách không thấy xác nhận**: thông báo `role="status"` render
   ở `top:-95px` (trên khung nhìn), trang không tự cuộn tới, form biến mất ⇒ dễ tưởng lỗi và
   gửi lại.
4. **Phân loại nợ kỹ thuật**: 5 (browser) + 7 (admin đợt 1) + 7 (admin đợt 2).
5. **N-01**: comment `Categories.ts:5` ghi "13 chuyên mục", DB có **12**. Chưa truy được.
6. **Siết `runs/verify-admin.sh`**: `git diff --quiet -- brandStyle.ts` chỉ so working tree
   → thay đổi ĐÃ COMMIT vào file cấm sẽ pass im lặng.

## Báo cáo review (trên `~/Desktop/`)

| File | Nội dung |
|---|---|
| `hiacc-site-review-2026-09-07.md` | site, đợt 1 — finding đã xử ở `T-review-fix` |
| `hiacc-admin-review-2026-09-07.md` | admin đợt 1 — 4 chặn + 7 nợ + 2 nghi vấn |
| `hiacc-admin-review-2-2026-09-07.md` | admin đợt 2 (HEAD mới hơn) — 4 chặn + 7 nợ |
| `hiacc-browser-review-2026-09-07.md` | trình duyệt thật — 1 chặn + 6 nợ |

Brief để chạy lại reviewer: `runs/BRIEF-review-{site,admin,browser}.md`

⚠️ **Đừng chạy 2 reviewer ghi DB song song.** Đợt này reviewer admin dọn dữ liệu test
giữa lúc reviewer browser đang đo → phép đo tràn ngang của browser hỏng, không kết luận
được. Cả hai cùng ghi `app/hiacc.db`. Cho browser (read-only) chạy trước, admin sau.
