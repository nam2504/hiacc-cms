#!/usr/bin/env bash
# Verify: chuỗi đến từ TỪ ĐIỂN i18n không được ra tiếng Việt trên trang /en.
# exit 0 = pass. Script tự in bằng chứng.
set -uo pipefail
BASE="${BASE:-http://localhost:3000}"
SCOPE="${1:-all}"
fail=0

# Các chuỗi VI lấy THẲNG từ src/lib/i18n.ts, mỗi chuỗi có bản EN khác hẳn trong i18n.en.ts.
# Xuất hiện trên trang /en = translator đóng băng.
check() { # $1=path  $2=chuỗi VI  $3=nhãn
  local body; body=$(curl -s --max-time 20 "$BASE$1")
  if [ -z "$body" ]; then echo "  ERR  $1 — không tải được"; fail=1; return; fi
  if grep -qF -- "$2" <<<"$body"; then
    echo "  FAIL $1 — còn \"$2\" ($3)"; fail=1
  else
    echo "  ok   $1 — sạch \"$2\""
  fi
}

echo "== scope: $SCOPE =="
case "$SCOPE" in
  layout|all)
    check /en/ke-toan "Tư vấn miễn phí"   "Header ctaLabel"
    check /en/ke-toan "Có thể bạn quan tâm" "service.related"
    check /en        "Lĩnh vực hoạt động"  "ServiceGroups"
    ;;&
  news|all)
    check /en/tin-tuc "Xem thêm"      "news · common.readMore"
    check /en/tin-tuc "Bài mới"        "news.list.latest"
    check /en/chuyen-muc "Chuyên mục" "news"
    ;;&
  pages|all)
    check /en/lien-he   "Gửi yêu cầu"   "contact"
    check /en/gioi-thieu "Hồ sơ công ty" "CompanyProfile"
    check /en/cong-cu/tinh-luong "Kết quả bóc tách" "payroll"
    ;;
esac

echo "-- tsc --"
# PHẢI lấy exit code của tsc, không phải của tail (pipe nuốt mất status).
tsc_out=$(cd "$(dirname "$0")/../app" && npx tsc --noEmit 2>&1); tsc_rc=$?
if [ $tsc_rc -eq 0 ]; then echo "  tsc ok"; else echo "  FAIL tsc (rc=$tsc_rc)"; echo "$tsc_out" | tail -5; fail=1; fi

echo "-- từ điển khớp --"
a=$(grep -cE "^\s*'[a-zA-Z0-9._]+':" app/src/lib/i18n.ts)
b=$(grep -cE "^\s*'[a-zA-Z0-9._]+':" app/src/lib/i18n.en.ts)
echo "  vi=$a en=$b"
[ "$a" = "$b" ] || { echo "  FAIL từ điển lệch"; fail=1; }

[ $fail -eq 0 ] && echo "PASS" || echo "FAILED"
exit $fail
