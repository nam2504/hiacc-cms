#!/usr/bin/env bash
# Restore HiACC CMS từ file backup .tar.gz tạo bởi scripts/backup.sh.
#
# GHI ĐÈ dữ liệu hiện tại (./data/hiacc.db và ./media/). Script dừng app trước
# khi ghi đè để tránh Payload đọc/ghi vào file đang bị thay giữa chừng, rồi
# khởi động lại sau khi restore xong.
#
# Dùng: ./scripts/restore.sh <đường_dẫn_file.tar.gz>
#
# ⚠️ Script này restore vào ./data/ + ./media/ của docker-compose LOCAL.
# Production trên Fly.io có DB ở /data/ TRONG máy ảo — restore lên Fly phải làm
# thủ công (flyctl ssh sftp put) và nên dừng máy trước. Chưa tự động hoá vì
# ghi đè nhầm DB production là mất dữ liệu khách, cần người xác nhận từng bước.

set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Dùng: $0 <đường_dẫn_file_backup.tar.gz>" >&2
  exit 1
fi

ARCHIVE="$1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

if [ ! -f "$ARCHIVE" ]; then
  echo "Không tìm thấy file backup: $ARCHIVE" >&2
  exit 1
fi

WORKDIR="$(mktemp -d)"
trap 'rm -rf "$WORKDIR"' EXIT

echo "[restore] Giải nén $ARCHIVE ..."
tar -xzf "$ARCHIVE" -C "$WORKDIR"

if [ ! -f "$WORKDIR/hiacc.db" ]; then
  echo "LỖI: file backup không có hiacc.db bên trong — sai định dạng?" >&2
  exit 1
fi

echo "[restore] Dừng app (nếu đang chạy qua docker compose) trước khi ghi đè dữ liệu..."
(cd "$ROOT_DIR" && docker compose stop app) 2>/dev/null || true

mkdir -p "$ROOT_DIR/data" "$ROOT_DIR/media"

echo "[restore] Ghi đè ./data/hiacc.db ..."
cp "$WORKDIR/hiacc.db" "$ROOT_DIR/data/hiacc.db"

# ⚠️ KIỂM TRA TRƯỚC KHI XOÁ, không phải ngược lại.
# Bản cũ chạy `rm -rf media/*` rồi MỚI hỏi archive có media không: restore từ
# một archive thiếu media sẽ xoá sạch ảnh đang có mà không phục hồi được gì —
# mất dữ liệu vĩnh viễn, đúng vào lúc người dùng đang cố cứu dữ liệu.
if [ -d "$WORKDIR/media" ]; then
  echo "[restore] Ghi đè ./media/ ..."
  rm -rf "${ROOT_DIR:?}/media"/*
  cp -r "$WORKDIR/media/." "$ROOT_DIR/media/" 2>/dev/null || true
else
  echo "[restore] Archive KHÔNG có thư mục media — giữ nguyên ./media/ hiện tại." >&2
  echo "          (chỉ DB được phục hồi; ảnh cũ không bị đụng tới)" >&2
fi

echo "[restore] Khởi động lại app..."
(cd "$ROOT_DIR" && docker compose start app) 2>/dev/null || echo "  (app chưa từng được tạo bằng 'docker compose up' — chạy 'docker compose up -d' thủ công)"

echo "[restore] Xong. Kiểm tra lại site và đăng nhập /admin."
