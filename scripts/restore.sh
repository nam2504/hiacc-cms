#!/usr/bin/env bash
# Restore HiACC CMS từ file backup .tar.gz tạo bởi scripts/backup.sh.
#
# GHI ĐÈ dữ liệu hiện tại (./data/hiacc.db và ./media/). Script dừng app trước
# khi ghi đè để tránh Payload đọc/ghi vào file đang bị thay giữa chừng, rồi
# khởi động lại sau khi restore xong.
#
# Dùng: ./scripts/restore.sh <đường_dẫn_file.tar.gz>

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

echo "[restore] Ghi đè ./media/ ..."
rm -rf "${ROOT_DIR:?}/media"/*
if [ -d "$WORKDIR/media" ]; then
  cp -r "$WORKDIR/media/." "$ROOT_DIR/media/" 2>/dev/null || true
fi

echo "[restore] Khởi động lại app..."
(cd "$ROOT_DIR" && docker compose start app) 2>/dev/null || echo "  (app chưa từng được tạo bằng 'docker compose up' — chạy 'docker compose up -d' thủ công)"

echo "[restore] Xong. Kiểm tra lại site và đăng nhập /admin."
