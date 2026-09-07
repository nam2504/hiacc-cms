# Handoff: đóng finding review site HiACC (đợt 07/09)

## Mục tiêu
Đóng hết finding chặn bàn giao từ review site, rồi chạy lại 2 reviewer còn thiếu
(admin + trình duyệt thật). Sau đó test trang chủ bằng Chrome thật.

## Trạng thái: 6/6 finding chặn ĐÃ ĐÓNG, cây làm việc sạch

Nhánh `feat/tenant-tach-va-cay-dich-vu`, HEAD `a958ce2`. Dev server chạy ở `localhost:3000`.

| Commit | Nội dung |
|---|---|
| `670f725` | B1 canonical `/tin-tuc` + `/chuyen-muc`; B2 link nội bộ giữ ngôn ngữ; B3 `Hero.tsx` |
| `4d7c38f` | sửa 2 check i18n không bao giờ đỏ |
| `37f1d90` | bảng màu admin lấy màu logo từ `TENANT` (bỏ ghim cứng HiACC) |
| `90ddd65` | sinh lại `payload-types.ts` |
| `77a3793` | B4 `og:url` + JSON-LD trên `/en` |
| `a958ce2` | B5 trang `/bang-gia` giữ chỗ + 3 trang thiếu trong sitemap + B6 cảnh báo `SITE_URL` |

## Đã xác định (kết luận, không phải code)

- **Wave i18n từng báo PASS là SAI.** `Hero.tsx` vẫn import `t` đóng băng; script verify của tôi
  có 2 check grep chuỗi KHÔNG hề render nên luôn xanh. Nay mọi check đều mutation-test.
  Neo: `runs/verify-i18n.sh:25,30`
- **Link nội bộ**: đo được 38 → 1 trên `/en`. Số 1 còn lại là `href="/"` — nút chuyển sang bản VI,
  **đúng thiết kế, đừng "sửa"**. Neo: `runs/FACTS-i18n-locale.md`
- **`og:url` + JSON-LD**: 14/14 trang đúng nhánh ngôn ngữ. `breadcrumbJsonLd` nay nhận tham số
  `locale` tuỳ chọn (mặc định VI, không phá nơi gọi cũ). Neo: `app/src/components/seo/JsonLd.tsx:160`
- **Sitemap thiếu 3 trang** (finding MỚI, không có trong báo cáo reviewer): `/van-ban-phap-luat`,
  `/cong-cu/tinh-luong`, `/bang-gia` có nội dung thật + canonical đầy đủ nhưng không được khai.
  126 → 132 URL. Neo: `app/src/app/(site)/sitemap.ts:36`
- **`NEXT_PUBLIC_SITE_URL` bị nướng cứng lúc `next build`** — set lúc `next start` là đã muộn.
  Nay `console.error` khi production thiếu biến. Neo: `app/src/lib/seo.ts:11`
- **Branding tenant**: `tenant.ts` là nguồn chân lý duy nhất; client component nhận màu qua
  `clientProps` của Payload, KHÔNG qua `NEXT_PUBLIC_*`. Neo: `app/src/globals/Settings.ts:72`
- **BÁC BỎ finding nghi P0 payroll**: "Lương Gross cần thoả thuận" nằm trong `.srOnly`
  (`clip: rect(0,0,0,0)`) — reviewer đọc DOM nên thấy node dành cho screen reader, mắt không thấy.
  81/81 test pass. Neo: `app/src/components/payroll/PayrollCalculator.tsx:253`
- **`ServiceNodes.ts:33` có `'bang-gia'`** trong `RESERVED_ROOT_SLUGS` — đó là danh sách slug CẤM,
  giữ nguyên, không phải link chết.

## Gate hiện tại (đã chạy, đều xanh)
```
bash runs/verify-i18n.sh all     # PASS, từ điển 214/214
bash runs/verify-admin.sh        # PASS
cd app && npm test               # 81 pass, 0 fail
cd app && npx tsc --noEmit       # rc=0
```

## Chưa biết / còn mở
- 5 finding NỢ KỸ THUẬT trong `~/Desktop/hiacc-site-review-2026-09-07.md` chưa phân loại.
- Báo cáo `~/Desktop/hiacc-admin-review-2026-09-07.md` đã có sẵn (32KB) nhưng CHƯA đọc.
- Layout 390px chưa đo được (`resize_window` báo thành công nhưng `innerWidth` vẫn 1854).
- `van-ban-phap-luat`: `localized: true` nhưng `payload.find` không truyền locale;
  `LEGAL_GROUPS` nhãn VI cứng.
- Reviewer **admin** và **trình duyệt thật** chết vì rate limit 429, chưa chạy lại.
  Brief sẵn: `runs/BRIEF-review-{admin,browser}.md`

## Bước tiếp theo
1. **Mở Chrome test trang chủ** (user yêu cầu) — `/` và `/en`, xem console error, layout, link.
2. Đọc `~/Desktop/hiacc-admin-review-2026-09-07.md` (đã có sẵn, chưa dùng).
3. Chạy lại 2 reviewer admin + browser trong CÙNG một response.

---

## Bổ sung sau khi test bằng Chrome thật (07/09)

**Bài học phương pháp: `curl` bỏ lọt cả một lớp lỗi.** Ba thứ dưới đây chỉ lộ ra trên
trình duyệt, HTML thì vẫn đúng:

- **BUG THẬT, đã sửa** (`7c768d5`): `TopBar.tsx` dùng `<nav className={styles.links}>` nhưng
  **class `.links` không tồn tại** trong `TopBar.module.css`. Nav thành block thường, 4 link
  dính liền: "PricingLegal documentsNewsletterContact". Đo: gap 0px → 16px sau khi sửa.
  Neo: `app/src/components/layout/TopBar.module.css:16`
- **Đã quét toàn repo cùng loại lỗi**: chỉ còn `Footer.tsx` dùng `styles.col` không tồn tại,
  nhưng `.grid` đã lo hết bố cục (4 cột 264px, gap 32px) nên KHÔNG hỏng gì. Rác vô hại,
  cố ý không dọn (AI-01). Neo: `app/src/components/layout/Footer.tsx:47`
- **Cookie `NEXT_LOCALE` làm lệch phép đo**: gõ `/` mà Chrome nhảy sang `/en`. Khi test tay
  phải set cookie tường minh, nếu không sẽ tưởng trang VI hỏng.

**11 chuỗi tiếng Việt còn trên `/en` KHÔNG phải bug** — đã xác minh từng cái:
tên/slogan/mô tả/địa chỉ/copyright (Settings) + 3 tiêu đề bài viết (Posts). Tất cả là nội dung DB.

**Admin ĐÃ có chỗ cho khách dịch** (đo trên `/admin/globals/settings?locale=en`):
bộ chọn `Locale: Tiếng Việt / English`, field dịch được mang hậu tố `— English`, có nút
"Copy to locale". Hero: 3/3 field dịch được, đang trống → đó là lý do `/en` hiện tiếng Việt.
Field cố ý KHÔNG dịch: `Tên website`, `Màu chủ đạo`. Schema DB xác nhận
(`settings_home_stats` có cột `_locale`).
=> Việc còn lại là **khách nhập nội dung EN**, không phải việc code.
