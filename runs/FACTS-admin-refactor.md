# Fact sheet — refactor trang admin (HiACC CMS)

> Neo: nhánh `feat/tenant-tach-va-cay-dich-vu`, khảo sát 2026-09-07.
> Orchestrator đã verify bằng lệnh chạy thật. **Agent KHÔNG verify lại.**
> ⚠️ Repo đang có 2 nhánh i18n khác chạy SONG SONG trên `src/components/` và `src/app/(site)/`.
> Contract này chỉ đụng `src/collections/`, `src/globals/`, `src/components/admin/` (mới) — không giao nhau.

## Việc 1 — `/admin/collections/pages` có phải code cũ không?

**KHÔNG.** User nghi nó là tàn dư, nhưng đo thật thì `pages` VẪN ĐANG DÙNG:

```
src/lib/site.ts:166        export const getPageBySlug = ... findOneBySlug<Page>('pages', slug, locale)
src/app/(site)/gioi-thieu/page.tsx:11,40,73   getPageBySlug(SLUG, locale)
src/app/(site)/lien-he/page.tsx:11,46,79      getPageBySlug(SLUG, locale)
src/seed/index.ts:154-167                     seed tạo/cập nhật bản ghi 'pages'
```
Xoá `pages` = trang Giới thiệu và Liên hệ mất nội dung. **KHÔNG ĐƯỢC XOÁ.**

Collection THẬT SỰ đã chết là `services` (cây `service-nodes` thay thế từ T-g2/T-dv):
`src/collections/Services.ts:24` đã có `hidden: true` — đã xử lý đúng rồi, không cần làm gì thêm.

→ Việc thật ở đây: `pages` hiện lên admin mà nhân viên không hiểu nó là gì (nó chỉ phục vụ
đúng 2 trang cố định: `gioi-thieu`, `lien-he`). Cần làm rõ trong admin, không phải xoá.

## Việc 2 — Cây dịch vụ hiển thị dạng tree

`src/collections/ServiceNodes.ts` — collection tự tham chiếu (`parent` trỏ về chính nó).
Hiện tại (dòng 40-52): `defaultColumns: ['title','parent','order','slug','updatedAt']`,
`defaultSort: 'parent'`, cộng một `description` giải thích. **Vẫn là BẢNG PHẲNG 37 dòng.**
Comment trong file tự nhận: "Payload chưa có view cây thật; đây là cách gần nhất mà không
phải dựng component admin riêng."

Dữ liệu thật: 5 nhóm gốc / 32 hạng mục con = 37 node. Sâu 2 tầng (schema cho phép sâu hơn).
Hook chặn vòng lặp đã có và đã verify chạy đúng (`ServiceNodes.ts:115-158`).

Payload 3.88 cho phép thay component admin qua `admin.components`. **Chưa có** thư mục
`src/components/admin/` — đây sẽ là component admin tuỳ biến ĐẦU TIÊN của repo.
`src/app/(payload)/admin/importMap.js` đã tồn tại; script `npm run generate:importmap` đã có
trong package.json. Component admin mới PHẢI chạy lại lệnh này, nếu không admin lỗi
"Module not found" (đây chính là P0-1 từng làm chết build, xem HANDOFF.md).

## Việc 3 — Rà soát Văn bản pháp luật / Chuyên mục

`src/collections/LegalDocuments.ts` (92 dòng): 7 nhóm hardcode dạng `select` options
(`ke-toan, thue, bhxh, lao-dong, dang-ky-kinh-doanh, dau-tu, thuong-mai`), nhãn tiếng Việt cứng.
Trường: title, code (số hiệu), group, issuer, effectiveYear.

`src/collections/Categories.ts` (49 dòng): `group` là select 2 giá trị hardcode
(`accounting`, `legal-hr`), nhãn tiếng Việt cứng. Trường: name, group, description, order, slug.

Cả hai đều `group: 'Nội dung'` trong admin.

⚠️ REVIEW-i18n.md đã ghi (đã verify): `van-ban-phap-luat` có field `localized: true` nhưng
`payload.find` KHÔNG truyền locale, và `LEGAL_GROUPS` nhãn VI cứng. Đây là finding CHƯA đóng.
Nhưng phần render nằm ở `src/app/(site)/van-ban-phap-luat/` — file đó KHÔNG thuộc contract này
(nhánh i18n khác có thể đang đụng). Chỉ sửa phần trong `src/collections/`.

## Việc 4 — Cấu hình: chọn màu bằng bảng màu thay vì gõ tay

`src/globals/Settings.ts:62-73` — field `primaryColor`, `type: 'text'`, không defaultValue
(cố ý: bỏ trống = dùng màu tenant, xem comment tại chỗ — ĐỪNG thêm defaultValue).
Nhân viên phải tự gõ `#RRGGBB`, gõ sai thì im lặng rơi về màu tenant.

Bên tiêu thụ đã có và đang chạy đúng: `src/lib/brandStyle.ts`.
- Regex `HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/` — đã verify chống XSS, ĐỪNG sửa,
  và ĐỪNG thêm cờ `m` (thêm là thủng thật).
- Nhận cả `#abc` lẫn `#aabbcc`. Giá trị sai định dạng → trả về màu tenant.
- Chỉ đè `--color-brand`, `-dark`, `-light`, `-tint`. `accent`/`ink` giữ nguyên (cố ý).

Màu chuẩn của tenant: `#CC1420` (đo từ pixel logo). Bảng màu gợi ý nên có nó làm mục đầu.

## Ràng buộc

- Rule AI-01: không tạo abstraction/helper mới ngoài thứ task yêu cầu.
- Rule AI-02: KHÔNG đổi tên/xoá field, collection slug, hay giá trị `value` của select đang có
  — DB đã có bản ghi dùng chúng, đổi là mất dữ liệu khách. Thêm thì được.
- Rule AI-03: không đổi API public + đổi logic trong cùng 1 commit.
- Rule AI-06: không sửa/xoá test cho pass.
- KHÔNG chạy `npm run seed` (nó ghi vào DB thật của user).
- KHÔNG sửa `src/lib/brandStyle.ts` (đã verify đúng), `src/lib/i18n*.ts` (nhánh khác đang giữ).

## Cách chạy & verify

```bash
cd ~/Documents/project/hiacc-cms/app
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/   # dev server có thể đang chạy sẵn
npx tsc --noEmit                    # phải sạch
npm run generate:importmap          # BẮT BUỘC sau khi thêm component admin
```
Admin: `http://localhost:3000/admin` · tài khoản `admin@gmail.com` / `Admin@123`.
