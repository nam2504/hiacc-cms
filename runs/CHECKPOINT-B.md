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
# Checkpoint B — T-v2-content (Track B)

State: BLOCKED

## Tóm tắt phát hiện
Trước khi tôi bắt đầu sửa, một quy trình seed KHÁC (đã tồn tại từ trước, nằm ngoài phạm vi
sở hữu track B — `app/src/seed/serviceTree.ts`, `serviceContent.ts`, `serviceTreeEn.ts`,
`migrateServices.ts`) đã hiện thực gần như toàn bộ nội dung mà contract B yêu cầu:
- 37 node service-nodes (5 nhóm + 32 hạng mục) — ĐÚNG số lượng contract yêu cầu.
- 30/32 hạng mục: title VI+EN đầy đủ, non-empty. Đã verify bằng query SQLite.
- 2 hạng mục demo (`ke-toan-tron-goi` nhóm Kế toán, `thay-doi-ten` nhóm Thay đổi ĐKKD):
  có block content (pricingTable/bulletList/fieldTable) đúng cấu trúc mô tả ở REQUIREMENTS mục 2.

`seed/data.ts` (file tôi được giao sở hữu) KHÔNG chứa nội dung 32 hạng mục — nó chỉ chứa
`SERVICES` (7 mục, collection `services` phẳng cũ, khác `service-nodes`). Source of truth
thật sự cho cây dịch vụ nằm ở `serviceTree.ts`/`serviceContent.ts`/`serviceTreeEn.ts`, không
khớp với invariant ghi trong contract ("source of truth: seed/data.ts"). Tôi không sửa gì
ở data.ts vì viết trùng nội dung 32 hạng mục vào đó sẽ tạo 2 nguồn ghi cùng collection
`service-nodes` — rủi ro đụng độ/nhân đôi, và cũng là abstraction mới ngoài yêu cầu (AI-01).

## Lỗi nghiêm trọng phát hiện qua verify thực tế (chạy `npm run seed` + query sqlite)
Chạy done-when: `npx tsc --noEmit` PASS, `npm test` PASS (81/81). Nhưng verify thủ công theo
đúng mô tả trong contract ("2 node demo phải có body blocks non-empty ở CẢ locale=vi và
locale=en") FAIL:

Query trực tiếp trên `hiacc.db` (sau khi chạy `npm run seed`):
```
service_nodes_blocks_pricing_table_locales   → chỉ có locale='en' (1 dòng), KHÔNG có 'vi'
service_nodes_blocks_pricing_table_rows_locales → chỉ 'en' (4 dòng)
service_nodes_blocks_bullet_list_locales     → chỉ 'en' (4 dòng)
service_nodes_blocks_bullet_list_items_locales → chỉ 'en' (17 dòng)
service_nodes_blocks_field_table_locales     → RỖNG hoàn toàn (0 dòng cả 2 locale)
service_nodes_blocks_field_table_rows_locales → chỉ 'en' (5 dòng)
```
→ Toàn bộ nội dung block (bảng giá, nhiệm vụ, cam kết...) của 2 node demo hiện chỉ tồn tại
ở locale EN trong DB. Bản VI — vốn là bản seed TRƯỚC (trong `serviceTree.ts::fillServiceContent`,
chạy trước `seedServiceTreeEn`) — đã biến mất khỏi các bảng con locale. Nghi vấn: khi
`seedServiceTreeEn.ts` gọi `payload.update({ collection: 'service-nodes', id, locale: 'en',
data: { body } })`, cách Payload lưu field localized LỒNG BÊN TRONG một `blocks` array
không-localized dường như đã ghi đè/thay thế toàn bộ nhóm dòng locale của field con thay vì
merge theo `_locale`, xoá mất các dòng 'vi' đã seed trước đó. Đây là bug thuộc logic
seed/schema tương tác giữa `blocks` + field `localized` lồng nhau — cần người hiểu rõ hành vi
Payload's localized-field-inside-non-localized-block để xác nhận đây là bug ở cách gọi seed
(`serviceTreeEn.ts`) hay ở schema (`blocks.ts`, thuộc sở hữu track B).

Thêm 1 phát hiện phụ: field `summary` (locale EN) của node demo `ke-toan-tron-goi` bị ghi
đè bằng placeholder "Detailed content is being updated." (PENDING_EN) thay vì bản dịch thật,
vì `serviceTreeEn.ts::ITEMS` không có `summary` cho item này (chỉ GROUPS có) — trong khi
GROUPS/ITEMS union type `NodeEn` có field `summary?`, code `data.summary = node.summary ??
PENDING_EN` áp dụng luôn cho node demo — không phân biệt "node demo cần nội dung đầy đủ" với
"30 node còn lại chỉ cần placeholder".

## Vì sao dừng lại thay vì tự sửa
- File cần sửa để khắc phục (`serviceTreeEn.ts`, `serviceTree.ts`) KHÔNG nằm trong 3 file
  track B được giao sở hữu (`ServiceNodes.ts`, `blocks.ts`, `seed/data.ts`).
- Sửa hành vi ghi localized-block trong Payload có thể đụng tới cách `blocks.ts` khai báo
  field localized (budget cấm: "phải đổi schema block hiện có" → BLOCKED).
- Không rõ đây là bug seed logic (sửa được trong `serviceTreeEn.ts`, ngoài sở hữu) hay do
  thiếu field/cấu hình ở `blocks.ts` (trong sở hữu, nhưng contract cấm đổi schema block sẵn có
  trừ khi thật sự thiếu — tôi chưa xác nhận được nguyên nhân gốc để biết có "thật sự thiếu"
  hay không).

## Việc CHƯA làm trong 3 file sở hữu track B
Không sửa gì trong `ServiceNodes.ts`, `blocks.ts`, `seed/data.ts` — schema đã đủ dùng như
contract đã xác nhận (facts), và nội dung 32 hạng mục đã tồn tại (dù có bug) ở nơi khác,
không phải data.ts. Thêm nội dung trùng vào data.ts sẽ tạo nguồn ghi thứ hai cho cùng
collection `service-nodes`, rủi ro cao hơn là có ích.

## Đề xuất bước tiếp theo (không tự quyết)
1. Xác nhận với orchestrator: liệu source-of-truth thực tế (`serviceTree.ts` +
   `serviceContent.ts` + `serviceTreeEn.ts`) có được chấp nhận thay cho `data.ts`, và
   contract cần cập nhật lại facts/invariant cho khớp thực tế.
2. Điều tra riêng bug mất locale 'vi' trong block con — nghi ở cách gọi
   `payload.update(..., locale: 'en', data: { body })` trong `serviceTreeEn.ts` (không thuộc
   sở hữu track B).
3. Sửa `serviceTreeEn.ts::ITEMS` để node demo có `summary` tiếng Anh thật, không rơi vào
   nhánh PENDING_EN.
