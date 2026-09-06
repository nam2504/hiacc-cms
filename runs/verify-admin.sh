#!/usr/bin/env bash
# Verify refactor admin. exit 0 = pass. Tự in bằng chứng từng bước.
set -uo pipefail
cd "$(dirname "$0")/../app" || exit 2
BASE="${BASE:-http://localhost:3000}"
fail=0
ok(){ echo "  ok   $1"; }
no(){ echo "  FAIL $1"; fail=1; }

echo "== 1. pages KHÔNG bị xoá (2 trang còn sống) =="
grep -q "getPageBySlug" src/lib/site.ts && ok "getPageBySlug còn" || no "getPageBySlug bị xoá"
grep -q "Pages" src/payload.config.ts && ok "Pages còn trong config" || no "Pages bị gỡ khỏi config"
for u in /gioi-thieu /lien-he; do
  c=$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "$BASE$u")
  n=$(curl -s --max-time 20 "$BASE$u" | sed 's/<[^>]*>/ /g' | wc -w)
  [ "$c" = "200" ] && [ "$n" -gt 80 ] && ok "$u $c, $n từ (có nội dung)" || no "$u $c, $n từ — rỗng hoặc chết"
done

echo "== 2. cây dịch vụ: component admin có đăng ký được không =="
if [ -d src/components/admin ]; then
  ok "có src/components/admin/"
  grep -q "beforeListTable" src/collections/ServiceNodes.ts && ok "ServiceNodes nối beforeListTable" || no "chưa nối component vào ServiceNodes"
  # importMap phải biết component mới, nếu không admin chết Module not found
  if grep -q "components/admin/ServiceTree" src/app/\(payload\)/admin/importMap.js; then ok "importMap có ServiceTree"; else no "importMap CHƯA sinh lại — chạy npm run generate:importmap"; fi
else
  no "chưa có src/components/admin/"
fi

echo "== 3. collection cũ không bị phá =="
for s in "slug: 'legal-documents'" "slug: 'categories'" "slug: 'service-nodes'" "slug: 'pages'"; do
  grep -rq "$s" src/collections/ && ok "$s còn" || no "$s BIẾN MẤT"
done
# value của select không được đổi (DB đang tham chiếu)
for v in "'ke-toan'" "'thue'" "'bhxh'" "'accounting'" "'legal-hr'"; do
  grep -rq "value: $v" src/collections/ && ok "select value $v còn" || no "select value $v bị đổi/xoá — mất dữ liệu"
done

echo "== 4. màu: field primaryColor còn đọc được, brandStyle nguyên vẹn =="
grep -q "name: 'primaryColor'" src/globals/Settings.ts && ok "primaryColor còn" || no "primaryColor bị đổi tên"
# Chỉ xét 6 dòng ngay sau khai báo field, đủ để bắt defaultValue của CHÍNH nó.
if sed -n "/name: 'primaryColor'/,+6p" src/globals/Settings.ts | grep -v "^\s*//" | grep -q "defaultValue"; then
  no "primaryColor bị thêm defaultValue (ghim màu HiACC vào DB HiTax)"
else ok "primaryColor không có defaultValue"; fi
git diff --quiet -- src/lib/brandStyle.ts && ok "brandStyle.ts không bị sửa" || no "brandStyle.ts bị sửa — cấm"
# Tên/mã màu thương hiệu chỉ được sống trong config/tenant.ts. Lọt vào code admin
# thì site HiTax hiện chữ "HiACC" cho khách khác đọc. Bỏ dòng comment (`//` và `*`
# của khối /** */) vì các comment ở đó đang giải thích chính luật này.
leak=$(grep -rn "HiACC\|CC1420\|cc1420" src/components/admin/ src/globals/ 2>/dev/null \
       | grep -v ":[[:space:]]*//" | grep -v ":[[:space:]]*\*")
if [ -n "$leak" ]; then
  no "chuỗi thương hiệu HiACC lọt vào admin ngoài comment:"; echo "$leak" | sed 's/^/       /'
else ok "không có chuỗi thương hiệu HiACC cứng trong admin"; fi

echo "== 5. admin sống + build sạch =="
c=$(curl -s -o /dev/null -w '%{http_code}' --max-time 30 "$BASE/admin")
[ "$c" = "200" ] || [ "$c" = "307" ] && ok "/admin $c" || no "/admin $c"
# Đọc EXIT CODE của tsc, không grep output: `npx tsc | tail | grep` lấy exit code
# của grep, và lỗi nằm ngoài 3 dòng cuối thì lọt.
tsc_out=$(npx tsc --noEmit 2>&1); tsc_rc=$?
if [ $tsc_rc -ne 0 ]; then no "tsc có lỗi:"; echo "$tsc_out" | head -5 | sed 's/^/       /'
else ok "tsc sạch"; fi

[ $fail -eq 0 ] && echo "PASS" || echo "FAILED"
exit $fail
