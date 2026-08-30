#!/usr/bin/env bash
# Backup HiACC CMS: file SQLite + thư mục media -> 1 file .tar.gz đặt tên theo ngày.
#
# Chạy từ đâu cũng được, script tự resolve đường dẫn theo vị trí của chính nó
# (giả định layout repo: scripts/ cạnh data/ và media/ ở gốc hiacc-cms/).
#
# Vì sao dùng `sqlite3 .backup` thay vì copy file trần: SQLite có thể đang ghi
# dở (WAL / transaction) khi app đang chạy, copy trần (cp) dễ lấy phải file
# nửa vời -> hỏng DB. Lệnh `.backup` là API chính thức của SQLite, an toàn khi
# DB đang mở, chờ transaction xong rồi chụp bản nhất quán.
#
# Dùng: ./scripts/backup.sh [thư_mục_đích]  (mặc định: ./backups)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

DB_FILE="$ROOT_DIR/data/hiacc.db"
MEDIA_DIR="$ROOT_DIR/media"
DEST_DIR="${1:-$ROOT_DIR/backups}"

mkdir -p "$DEST_DIR"

if [ ! -f "$DB_FILE" ]; then
  echo "Không tìm thấy $DB_FILE — kiểm tra volume ./data đã được mount đúng chưa (xem docker-compose.yml)." >&2
  exit 1
fi

TS="$(date +%Y%m%d-%H%M%S)"
WORKDIR="$(mktemp -d)"
trap 'rm -rf "$WORKDIR"' EXIT

echo "[backup] Chụp SQLite bằng 'sqlite3 .backup' (an toàn khi app đang chạy)..."
if command -v sqlite3 >/dev/null 2>&1; then
  sqlite3 "$DB_FILE" ".backup '$WORKDIR/hiacc.db'"
else
  # Máy không có sqlite3 CLI: dùng container app sẵn có (đã cài libsql qua @libsql/client)
  # để chạy backup bên trong, tránh phụ thuộc thêm gói ngoài.
  echo "[backup] Không có sqlite3 CLI trên host, dùng container 'app' để backup..." >&2
  if ! docker compose -f "$ROOT_DIR/docker-compose.yml" exec -T app node -e "
    const fs = require('fs');
    fs.copyFileSync('/data/hiacc.db', '/data/.backup-tmp.db');
  " 2>/dev/null; then
    echo "LỖI: không có 'sqlite3' trên host và không gọi được container 'app' đang chạy." >&2
    echo "Cài sqlite3 (apt install sqlite3) hoặc đảm bảo 'docker compose up -d' đang chạy rồi thử lại." >&2
    exit 1
  fi
  cp "$ROOT_DIR/data/.backup-tmp.db" "$WORKDIR/hiacc.db"
  rm -f "$ROOT_DIR/data/.backup-tmp.db"
fi

mkdir -p "$WORKDIR/media"
if [ -d "$MEDIA_DIR" ]; then
  cp -r "$MEDIA_DIR/." "$WORKDIR/media/" 2>/dev/null || true
fi

ARCHIVE="$DEST_DIR/hiacc-backup-$TS.tar.gz"
tar -czf "$ARCHIVE" -C "$WORKDIR" hiacc.db media

echo "[backup] Xong: $ARCHIVE"
ls -lh "$ARCHIVE"
