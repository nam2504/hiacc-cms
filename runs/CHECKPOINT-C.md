# CHECKPOINT C — trang nội dung + 4 client component

> state: **BUDGET** — mọi file trong `sở hữu` đã xong và verify xanh về nội dung,
> nhưng `npx tsc --noEmit` còn 1 lỗi nằm ở file NGOÀI `sở hữu`.

## Đã làm xong (11 file, đều trong `sở hữu`)

Server component — đổi `t` → `createTranslator(await getRequestLocale())`:
- `app/src/app/(site)/lien-he/page.tsx` — thêm `tr` ở cả `generateMetadata` và page; truyền `locale` xuống `<ContactForm>`
- `app/src/app/(site)/gioi-thieu/page.tsx` — thêm `tr` ở cả hai hàm
- `app/src/app/(site)/not-found.tsx` — đã có `locale` sẵn, chỉ thêm `tr`
- `app/src/app/(site)/cong-cu/tinh-luong/page.tsx` — thêm `locale` + `tr`; truyền `locale` xuống `<PayrollCalculator>`
- `app/src/components/pages/ContactInfo.tsx` — chuyển thành `async`, tự gọi `getRequestLocale()`
- `app/src/components/pages/PageBody.tsx` — chuyển thành `async`, gọi `getRequestLocale()` trong nhánh fallback
- `app/src/components/pages/BranchList.tsx` — chuyển thành `async`; truyền `locale` xuống `<BranchMap>`

Client component — nhận `locale` qua props, `createTranslator(locale)` trong thân hàm
(theo đúng mẫu `MegaMenu.tsx:41` / `Header.tsx:31`):
- `app/src/components/payroll/PayrollCalculator.tsx` — thêm prop `locale`; **55 lời gọi `t(...)` giữ nguyên từng byte** (translator cục bộ vẫn đặt tên `t`, che import cũ). KHÔNG động vào công thức, hằng số thuế/bảo hiểm, `parseInput.ts`, `calc.ts`.
- `app/src/components/contact/ContactForm.tsx` — thêm prop `locale`; `SubmitButton` (component nội bộ sẵn có) nhận `t` qua prop vì nó nằm dưới `<form>`
- `app/src/components/map/BranchMap.tsx` — thêm prop `locale`
- `app/src/components/layout/LanguageSwitcher.tsx` — dùng lại prop `current` sẵn có làm locale dịch (không thêm prop trùng). **Lưu ý: component này hiện KHÔNG có caller nào trong `src` — dead code.**

## Khoá i18n đã thêm

**KHÔNG thêm khoá nào.** Mọi khoá cần dùng (`payroll.*`, `page.contentComingSoon`, `contact.*`,
`branches.*`, `common.*`, `error.notFound.*`) đã có sẵn trong cả hai từ điển.
`app/src/lib/i18n.ts` và `app/src/lib/i18n.en.ts` KHÔNG bị nhánh C sửa.

## Blocker — vì sao BUDGET

`app/src/app/(site)/page.tsx:121` (trang chủ) là **parent thứ hai** của `<ContactForm>`.
Nhánh C không sở hữu file này, và `git status` cho thấy nhánh khác đang sửa nó ngay lúc này.

```
src/app/(site)/page.tsx(121,10): error TS2741: Property 'locale' is missing in type '{}' but required in type '{ locale: string; }'.
```

Sửa cần đúng MỘT dòng, và `locale` đã có sẵn trong scope (khai ở dòng 69 của file đó):

```diff
-        <ContactForm />
+        <ContactForm locale={locale} />
```

Đã cân nhắc và BÁC BỎ phương án cho `locale` thành optional (`locale?: string`) để tsc khỏi đỏ:
làm thế thì trang chủ lặng lẽ rơi về `DEFAULT_LOCALE`, tức form tư vấn trên `/en` vẫn hiện tiếng
Việt — đúng cái bug đang đi sửa, chỉ khác là bị giấu khỏi type checker. Giữ prop bắt buộc để lỗi
lộ ra, đúng quy ước mà `MegaMenu`/`Header` đã dùng.

## Đã verify bằng lệnh nào

`cd ~/Documents/project/hiacc-cms && ./runs/verify-i18n.sh pages`

Trước khi sửa (baseline):
```
  FAIL /en/lien-he — còn "Gửi yêu cầu" (contact)
  ok   /en/gioi-thieu — sạch "Hồ sơ công ty"
  ok   /en/cong-cu/tinh-luong — sạch "Tính lương"
  tsc ok
  vi=211 en=211
FAILED
```

Sau khi sửa:
```
  ok   /en/lien-he — sạch "Gửi yêu cầu"
  ok   /en/gioi-thieu — sạch "Hồ sơ công ty"
  ok   /en/cong-cu/tinh-luong — sạch "Tính lương"
  src/app/(site)/page.tsx(121,10): error TS2741: ...
  FAIL tsc
  vi=212 en=212
FAILED
```

Cả 3 check nội dung đã chuyển từ 1 FAIL → 0 FAIL. Chỉ còn tsc đỏ vì file ngoài phạm vi.

### Đo bù cho chỗ script kiểm hụt

Check `/en/cong-cu/tinh-luong "Tính lương"` là **false-positive ở baseline**: chuỗi
`'payroll.title'` là "Công cụ tính lương…" (chữ `t` thường), nên grep không bao giờ bắt được —
script báo `ok` cả khi trang còn nguyên tiếng Việt. Đã đo lại bằng nhãn thật:

```
/en/cong-cu/tinh-luong   "Kết quả bóc tách" 0 · "Lương Gross" 0 · "Chiều tính" 0
                         "Lưu ý quan trọng" 0 · "Số người phụ thuộc" 0
                         "Breakdown" 1 · "Gross salary" 1 · "dependants" 1
/cong-cu/tinh-luong      "Kết quả bóc tách" 1 · "Chiều tính" 1 · "Lưu ý quan trọng" 1   (VI không hồi quy)
/en/lien-he              "Send request" 1 · "Gửi yêu cầu" 0 · "Hotline" 1
/lien-he                 "Gửi yêu cầu" 1 · "Send request" 0                              (VI không hồi quy)
```

## Bước kế tiếp (cho orchestrator lúc merge)

1. Thêm `locale={locale}` vào `<ContactForm />` ở `app/src/app/(site)/page.tsx:121`.
   Giao cho nhánh đang sở hữu file đó, hoặc orchestrator làm lúc merge. Sau đó `tsc` sạch.
2. Quyết định về `LanguageSwitcher.tsx`: hiện không ai gọi. Hoặc gắn vào Header/TopBar
   (file của nhánh khác), hoặc xoá. Nhánh C không tự quyết vì cả hai lối đều đụng file ngoài phạm vi.

## Còn gì chưa biết

- `PageBody`, `ContactInfo`, `BranchList` đã chuyển sang `async`. Trong RSC điều này an toàn với
  mọi call site hiện có (server component async dùng được ở đúng chỗ bản sync dùng được), và tsc
  không báo lỗi nào ở các call site đó. Nhưng `PageBody` còn được gọi từ trang dịch vụ thuộc
  nhánh khác — nếu nhánh đó lỡ import nó vào một file `'use client'` thì sẽ vỡ lúc runtime chứ
  không phải lúc compile. Đã grep: hiện KHÔNG có call site client nào.
- Không đụng `app/src/lib/i18n.ts` / `i18n.en.ts`, nên không có rủi ro tranh chấp từ điển từ nhánh C.
  Số khoá nhảy 211 → 212 trong lúc chạy là do nhánh khác thêm, hai file vẫn khớp.
