# CHECKPOINT B — Tin tức & chuyên mục

> Trạng thái trả về: **BUDGET** (phần việc của B đã xong; done-when đỏ vì file NGOÀI `sở hữu`).

## Đã làm tới đâu — XONG toàn bộ phần thuộc `sở hữu`

11/11 file đã bỏ `t` đóng băng, chuyển sang translator theo locale của request.
Không còn `import { t }` trong bất kỳ file nào thuộc B.

| File | Cách sửa |
|---|---|
| `app/src/app/(site)/tin-tuc/page.tsx` | `generateMetadata` → `async`, tự lấy locale; body dùng `locale` sẵn có |
| `app/src/app/(site)/tin-tuc/[slug]/page.tsx` | `createTranslator(locale)` ở cả `generateMetadata` lẫn page |
| `app/src/app/(site)/chuyen-muc/page.tsx` | `generateMetadata` → `async`; body dùng `locale` sẵn có |
| `app/src/app/(site)/chuyen-muc/[slug]/page.tsx` | `createTranslator(locale)` ở cả hai hàm |
| `app/src/components/news/Pagination.tsx` | → `async`, tự `getRequestLocale()` |
| `app/src/components/news/PostArticle.tsx` | dùng lại `locale` đã `await` sẵn trong hàm |
| `app/src/components/news/PageHero.tsx` | dùng lại `locale` đã `await` sẵn trong hàm |
| `app/src/components/news/PostCard.tsx` | → `async`, tự `getRequestLocale()` |
| `app/src/components/news/EmptyState.tsx` | → `async`, tự `getRequestLocale()` |
| `app/src/components/news/CategoryGroups.tsx` | → `async`, tự `getRequestLocale()` |
| `app/src/components/seo/JsonLd.tsx` | `isPlaceholder`/`compact` nhận `locale` TUỲ CHỌN, default `DEFAULT_LOCALE` |

### Khoá i18n đã thêm (1 khoá, đúng tiền tố `news.`, thêm vào CẢ HAI từ điển)
- `news.list.latest` — vi `'Bài mới'` / en `'Latest articles'`
  (trước đó là chuỗi cứng ở `tin-tuc/page.tsx` dòng 55, không qua translator)

Từ điển vẫn khớp: **vi=212 en=212**. Không sửa/xoá/đổi tên khoá cũ nào.

## Quyết định thiết kế đáng lưu ý cho orchestrator

1. **`JsonLd.tsx` giữ chữ ký tương thích ngược — CỐ Ý.**
   `JsonLd`, `breadcrumbJsonLd`, `accountingServiceJsonLd` được import từ 3 file
   NGOÀI `sở hữu` của B: `(site)/page.tsx`, `(site)/[...slug]/page.tsx`,
   `(site)/gioi-thieu/page.tsx`. Nên `isPlaceholder(value, locale?)` và
   `compact(node, locale?)` nhận locale **tuỳ chọn**, default `DEFAULT_LOCALE` —
   caller cũ không phải sửa gì, không vỡ build của nhánh A/C.
   Ảnh hưởng: `seo.placeholder.pending` vẫn so khớp theo bản VI khi caller không
   truyền locale. Đây là so khớp NỘI BỘ để loại giá trị giữ chỗ, không phải chuỗi
   hiển thị ra trang → không gây rò tiếng Việt. Nếu orchestrator muốn triệt để,
   3 caller kia phải truyền locale xuống — việc đó nằm ngoài `sở hữu` của B.

2. **`PostCard` thành `async` nhưng `PostGrid.tsx` (không sở hữu) không phải sửa.**
   `PostGrid` render `<PostCard post={post} />` trong `.map()`; React Server
   Component nhận con async bình thường. Đã xác nhận `tsc` không báo lỗi JSX nào
   ở `PostGrid`.

3. Không tạo helper/abstraction mới (AI-01) — chỉ dùng `createTranslator` +
   `getRequestLocale` đã có. Không sửa `src/lib/i18n.ts:336` (`export const t`).

## Đã verify bằng lệnh nào

Baseline TRƯỚC khi sửa (`./runs/verify-i18n.sh news`):
```
  ok   /en/tin-tuc — sạch "Đọc tiếp"
  ok   /en/tin-tuc — sạch "Chuyên mục"
  FAIL /en/chuyen-muc — còn "Chuyên mục" (news)     ← lỗi thật của B
  vi=211 en=211
FAILED
```

SAU khi sửa — 3 check nội dung của scope `news` XANH và ỔN ĐỊNH (lấy mẫu 3 lần
cách nhau 6s):
```
  ok   /en/tin-tuc — sạch "Đọc tiếp"
  ok   /en/tin-tuc — sạch "Chuyên mục"
  ok   /en/chuyen-muc — sạch "Chuyên mục"
  vi=212 en=212
```

Kiểm chứng dương tính (không chỉ "vắng chuỗi VI" mà thật sự RA tiếng Anh):
```
/en/tin-tuc          → found: News · Latest articles · Breadcrumb   (0 VI leak)
/en/chuyen-muc       → found: Categories · News · Breadcrumb        (0 VI leak)
/en/tin-tuc/<slug>   → found: Back to news · Home · News · Breadcrumb (0 VI leak)
```

`tsc` giới hạn trong 11 file thuộc B: **sạch, 0 lỗi** (đã lọc bằng
`npx tsc --noEmit | grep -E "\(site\)/tin-tuc|\(site\)/chuyen-muc|components/news/|components/seo/JsonLd|lib/i18n"`).

## Vì sao trả BUDGET — done-when đỏ ở phần KHÔNG thuộc B

`verify-i18n.sh` có gate `tsc` chạy trên TOÀN repo. Repo đang bị 3 nhánh ghi song
song, và gate này đỏ vì file của nhánh khác đang sửa dở:

```
src/app/(site)/lien-he/page.tsx(85,45):  error TS2304: Cannot find name 'tr'.
src/app/(site)/lien-he/page.tsx(100,26): error TS2322: Property 'locale' does not
                                          exist on type 'IntrinsicAttributes'.
src/app/(site)/lien-he/page.tsx(105,35): error TS2304: Cannot find name 'tr'.
```

`lien-he` thuộc scope `pages` (nhánh C), KHÔNG nằm trong `sở hữu` của B → theo
`budget:` trong contract thì B DỪNG, không tự sửa.

Bằng chứng đây là race chứ không phải hồi quy do B:
- Ngay trước đó `npx tsc --noEmit` trong app trả **rc=0** (sạch toàn repo).
- Vài giây sau, cùng lệnh đó đỏ ở `lien-he/page.tsx`.
- Trong quá trình làm, tập lỗi `tsc` đã dịch chuyển qua các file của nhánh khác:
  `(site)/page.tsx` → `components/pages/BranchList.tsx` →
  `components/payroll/PayrollCalculator.tsx` → (sạch) → `(site)/lien-he/page.tsx`.

⚠️ Lưu ý cho orchestrator: gate `tsc` trong `verify-i18n.sh` viết là
`if (cd ... && npx tsc --noEmit 2>&1 | tail -5)` — exit code lấy của `tail`, LUÔN 0.
Nên dòng "tsc ok" ở các lần chạy trước KHÔNG chứng minh gì; nó in "FAIL tsc" chỉ
khi... thực ra không bao giờ, trừ khi subshell `cd` hỏng. Lần chạy đỏ ở trên là do
`tail -5` in ra đúng 5 dòng lỗi, không phải do exit code. Gate này cần sửa thành
bắt `PIPESTATUS[0]` nếu muốn nó thật sự chặn.

## Bước kế tiếp (ai đó khác làm, không phải B)

1. Chờ nhánh C sửa xong `src/app/(site)/lien-he/page.tsx` (đang thiếu khai báo `tr`,
   và truyền prop `locale` vào component chưa khai prop đó).
2. Chạy lại `./runs/verify-i18n.sh news` → 3 check nội dung sẽ xanh (đã ổn định),
   gate `tsc` xanh theo khi `lien-he` hết lỗi.
3. Cân nhắc sửa gate `tsc` của `verify-i18n.sh` để nó thật sự chặn (dùng
   `PIPESTATUS[0]`), vì hiện tại nó cho qua mọi lỗi type.

## Còn gì chưa biết

- Có thể nhánh A/C sẽ đụng `i18n.ts` / `i18n.en.ts` cùng lúc. B chỉ THÊM đúng 1 khoá
  `news.list.latest` vào cả hai file, neo bằng nội dung (không theo số dòng), nên
  merge nên sạch — nhưng orchestrator vẫn cần xác nhận số khoá hai bên còn khớp sau
  khi gộp cả 3 nhánh.
- `verify-i18n.sh` check chuỗi `"Đọc tiếp"` trên `/en/tin-tuc`, nhưng chuỗi này
  KHÔNG tồn tại ở đâu trong `src` (đã grep toàn bộ). Check đó xanh một cách vô
  điều kiện, không đo được gì. Chuỗi "xem thêm" thật là `common.readMore` = `'Xem thêm'`
  trong `PostCard.tsx` — B đã sửa `PostCard` đúng cách nên nó ra tiếng Anh, nhưng
  nếu orchestrator muốn check này có giá trị thì nên đổi chuỗi thành `"Xem thêm"`.
