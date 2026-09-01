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

# ⚠️ Production chạy trên Fly.io, KHÔNG phải docker-compose: DB thật nằm ở
# /data/hiacc.db TRONG máy ảo, không có trên đĩa máy này. Script trỏ ./data/
# sẽ thoát ở dòng "Không tìm thấy" và KHÔNG backup được bản duy nhất có dữ
# liệu khách — im lặng cho tới đúng lúc cần restore.
#
# Dùng FLY_APP=<tên app> để backup máy Fly, không đặt thì backup ./data/ local.
FLY_APP="${FLY_APP:-}"

DB_FILE="$ROOT_DIR/data/hiacc.db"
MEDIA_DIR="$ROOT_DIR/media"
DEST_DIR="${1:-$ROOT_DIR/backups}"

mkdir -p "$DEST_DIR"

TS="$(date +%Y%m%d-%H%M%S)"
WORKDIR="$(mktemp -d)"
trap 'rm -rf "$WORKDIR"' EXIT

if [ -n "$FLY_APP" ]; then
  # Backup máy Fly: chụp DB bằng VACUUM INTO (tương đương .backup, an toàn khi
  # app đang ghi) rồi kéo cả DB lẫn media về qua ssh sftp.
  command -v flyctl >/dev/null 2>&1 || { echo "LỖI: không có flyctl trong PATH (thử: export PATH=\"\$HOME/.fly/bin:\$PATH\")." >&2; exit 1; }
  echo "[backup] Chụp DB trên Fly app '$FLY_APP' bằng VACUUM INTO..."
  flyctl ssh console -a "$FLY_APP" -C "node -e \"
    const {createClient}=require('/app/node_modules/@libsql/client');
    const fs=require('fs');
    try{fs.unlinkSync('/data/.backup-tmp.db')}catch(e){}
    createClient({url:'file:/data/hiacc.db'})
      .execute(\\\"VACUUM INTO '/data/.backup-tmp.db'\\\")
      .then(()=>console.log('ok')).catch(e=>{console.error(e.message);process.exit(1)});
  \"" >/dev/null || { echo "LỖI: không chụp được DB trên Fly (máy có đang chạy không? 'flyctl status -a $FLY_APP')" >&2; exit 1; }

  mkdir -p "$WORKDIR/media"
  flyctl ssh sftp get /data/.backup-tmp.db "$WORKDIR/hiacc.db" -a "$FLY_APP" >/dev/null \
    || { echo "LỖI: không tải được DB về từ Fly." >&2; exit 1; }
  echo "[backup] Kéo media về (có thể lâu nếu nhiều ảnh)..."
  flyctl ssh console -a "$FLY_APP" -C "tar -czf /data/.backup-media.tgz -C /data/media ." >/dev/null 2>&1 || true
  flyctl ssh sftp get /data/.backup-media.tgz "$WORKDIR/media.tgz" -a "$FLY_APP" >/dev/null 2>&1 \
    && tar -xzf "$WORKDIR/media.tgz" -C "$WORKDIR/media" && rm -f "$WORKDIR/media.tgz" \
    || echo "  (không lấy được media — DB vẫn được backup)" >&2
  flyctl ssh console -a "$FLY_APP" -C "rm -f /data/.backup-tmp.db /data/.backup-media.tgz" >/dev/null 2>&1 || true

  ARCHIVE="$DEST_DIR/hiacc-backup-fly-$TS.tar.gz"
  tar -czf "$ARCHIVE" -C "$WORKDIR" hiacc.db media
  echo "[backup] Xong: $ARCHIVE"
  ls -lh "$ARCHIVE"
  exit 0
fi

if [ ! -f "$DB_FILE" ]; then
  echo "Không tìm thấy $DB_FILE." >&2
  echo "Nếu production chạy trên Fly.io thì DB KHÔNG nằm trên máy này — dùng:" >&2
  echo "    FLY_APP=hiacc-cms-staging ./scripts/backup.sh" >&2
  exit 1
fi

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
