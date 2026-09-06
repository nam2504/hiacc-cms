# Fact sheet — bug locale đóng băng (HiACC CMS)

> Neo: nhánh `feat/tenant-tach-va-cay-dich-vu`, HEAD `34de429`, working tree SẠCH lúc khảo sát 2026-09-07.
> Orchestrator đã verify từng mục dưới đây bằng lệnh chạy thật. **Agent KHÔNG verify lại.**

## Bug gốc (một câu)

`src/lib/i18n.ts:336` — `export const t = createTranslator(DEFAULT_LOCALE)`.
`t` là translator **đóng băng ở tiếng Việt lúc import module**. 31 file đang import và gọi `t()`,
nên mọi chuỗi qua `t()` trên trang `/en/*` hiện ra tiếng Việt.

Đây KHÔNG phải "vài chuỗi hardcode" — đó là chẩn đoán cũ trong `hitax/HANDOFF-fix-i18n.md`
và nó **thiếu**. Nguyên nhân thật là translator đóng băng.

## Mẫu ĐÚNG đã có sẵn trong repo (dùng lại, đừng phát minh)

Server component:
```ts
import { createTranslator } from '@/lib/i18n'
import { getRequestLocale } from '@/lib/requestLocale'

export async function Foo() {
  const locale = await getRequestLocale()
  const tr = createTranslator(locale)
  return <p>{tr('some.key')}</p>
}
```
Ví dụ sống: `src/app/(site)/layout.tsx:76-82`, `src/components/layout/Header.tsx:33`.

Client component: KHÔNG gọi `getRequestLocale()` (nó dùng `headers()`, chỉ chạy phía server).
Nhận `locale` qua props từ component cha, rồi `createTranslator(locale)`.
Ví dụ sống: `src/components/layout/MegaMenu.tsx:41`.

`getRequestLocale()` (`src/lib/requestLocale.ts`) đọc header `x-locale` do `src/middleware.ts` đặt.
Đã verify hoạt động: `/en/ke-toan` render tiêu đề tiếng Anh.

## Đã có sẵn — ĐỪNG làm lại

- `createTranslator(locale)` đã tồn tại và chạy đúng. Không cần viết hàm mới.
- `getRequestLocale()` đã tồn tại và chạy đúng.
- `localizedHref(href, locale, DEFAULT_LOCALE)` (`src/lib/nav.ts:32`) đã tồn tại, đã dùng ở 13 file.
- Hai từ điển `src/lib/i18n.ts` và `src/lib/i18n.en.ts` **khớp tuyệt đối** (đã verify 191/191 khoá,
  không thừa/thiếu/trùng). Thêm khoá mới thì phải thêm vào **cả hai**, giữ khớp.
- Nút chuyển ngôn ngữ (`MegaMenu.tsx:180`) đúng — `href="/ke-toan"` không có `/en` trên trang `/en`
  là **link sang bản VI**, đúng thiết kế. ĐỪNG "sửa" nó.
- `middleware.ts`, sitemap, canonical/hreflang, seed idempotent: đã sửa ở commit `8f5d08a`, đang đúng.

## Phân loại 31 file (đã verify bằng `head -1 | grep "use client"`)

CLIENT (nhận locale qua props, KHÔNG gọi getRequestLocale):
```
src/components/payroll/PayrollCalculator.tsx   55 lời gọi t(
src/components/contact/ContactForm.tsx         24
src/components/map/BranchMap.tsx                3
src/components/layout/LanguageSwitcher.tsx      1
```

SERVER (dùng getRequestLocale + createTranslator):
```
src/components/layout/Footer.tsx                8
src/app/(site)/tin-tuc/page.tsx                 8
src/app/(site)/chuyen-muc/[slug]/page.tsx       8
src/app/(site)/chuyen-muc/page.tsx              8
src/components/home/Social.tsx                  6
src/components/home/Branches.tsx                6
src/app/(site)/tin-tuc/[slug]/page.tsx          6
src/components/news/Pagination.tsx              5
src/components/home/About.tsx                   5
src/app/(site)/lien-he/page.tsx                 5
src/app/(site)/cong-cu/tinh-luong/page.tsx      5
src/components/pages/ContactInfo.tsx            4
src/components/pages/BranchList.tsx             4
src/components/home/Knowledge.tsx               3
src/app/(site)/page.tsx                         3
src/app/(site)/not-found.tsx                    3
src/components/news/PostArticle.tsx             2
src/components/news/PageHero.tsx                2
src/components/home/CallToAction.tsx            2
src/app/(site)/gioi-thieu/page.tsx              2
src/components/seo/JsonLd.tsx                   1
src/components/pages/PageBody.tsx               1
src/components/news/PostCard.tsx                1
src/components/news/EmptyState.tsx              1
src/components/news/CategoryGroups.tsx          1
src/components/layout/TopBar.tsx                1
src/components/home/Stats.tsx                   1
```

`TopBar.tsx` là ca sửa nửa vời: dòng 29 đã tạo `tr` đúng nhưng dòng 41 vẫn gọi `t('common.hotline')`.

## Chuỗi cứng (không qua t()) — phải thêm khoá vào CẢ HAI từ điển

```
src/components/services/ServiceSidebar.tsx:32  'Danh sách hạng mục'   (default của prop title)
src/components/services/ServiceSidebar.tsx:33  'Nội dung'
src/components/services/ServiceBody.tsx:34     'Bảng giá dịch vụ'     (fallback khi block.title rỗng)
src/components/home/ServiceGroups.tsx:29       'Lĩnh vực hoạt động'   (fallback khi Settings rỗng)
src/components/home/ServiceGroups.tsx:32       'Từ kế toán trọn gói tới giấy phép hoạt động — chọn đúng phần doanh nghiệp bạn cần.'
src/components/layout/Header.tsx:45            ctaLabel="Tư vấn miễn phí"  (prop truyền xuống MegaMenu)
```
Lưu ý: fallback là chuỗi hiển thị cho người dùng → PHẢI qua translator. Không phải chỉ literal trong code.

## Cách chạy & verify

```bash
cd ~/Documents/project/hiacc-cms/app
npm run dev        # :3000 — CÓ THỂ ĐANG CHẠY SẴN, curl thử trước khi bật thêm
npx tsc --noEmit   # phải sạch
```

Đếm từ tiếng Việt có dấu trên một trang (đo trước khi sửa, để so):
```
/en                      689 từ có dấu
/en/van-ban-phap-luat    498
/en/tin-tuc              837
/en/lien-he              570
/en/ke-toan              212
```
⚠️ Con số này gồm CẢ nội dung từ DB (khách chưa dịch — đúng thiết kế, KHÔNG phải bug, xem WS-6/T-content).
Vì vậy **đích không phải 0**. Đích là: mọi chuỗi đến từ TỪ ĐIỂN i18n phải ra tiếng Anh.
Cách đo đúng: grep các chuỗi cụ thể có trong `i18n.ts` mà không được xuất hiện trên trang `/en`.

## Ràng buộc

- Rule AI-01: KHÔNG tạo abstraction/helper mới. `createTranslator` + `getRequestLocale` đã đủ.
- Rule AI-02: KHÔNG đổi tên/xoá khoá i18n đang có. Chỉ THÊM khoá mới.
- Rule AI-06: KHÔNG sửa/xoá test để cho pass.
- Không sửa `src/lib/i18n.ts:336` (`export const t`) — còn file ngoài phạm vi wave này dùng.
  Việc của wave là làm cho các file trong `sở hữu` thôi dùng `t`, không phải xoá `t`.
