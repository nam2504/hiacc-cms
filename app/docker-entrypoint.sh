#!/bin/sh
# Chạy migration TRƯỚC khi khởi động server.
#
# Vì sao cần: Payload chỉ tự tạo bảng khi NODE_ENV != 'production'. Image chạy
# production, nên DB mới toanh không có bảng nào. `prodMigrations` trong
# payload.config có chạy migration lúc Payload khởi tạo, nhưng chỉ khi có thứ gì
# đó khởi tạo Payload — `npm run seed` trên DB trống thì chết trước đó với
# "no such table: categories".
#
# Chạy migrate ở đây làm cho MỌI đường vào (server, seed, script) đều gặp DB đã
# có bảng. Migration đã chạy rồi thì lệnh này không làm gì, nên khởi động lại
# nhiều lần vô hại.
set -e

if [ -n "$MEDIA_DIR" ]; then
  # Thư mục media nằm trên volume, lần đầu mount là thư mục rỗng thuộc root.
  mkdir -p "$MEDIA_DIR" 2>/dev/null || true
fi

echo "[entrypoint] chạy migration..."
node node_modules/payload/bin.js migrate

echo "[entrypoint] khởi động server..."
exec "$@"
