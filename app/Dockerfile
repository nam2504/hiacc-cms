# syntax=docker/dockerfile:1
# Dockerfile production cho HiACC CMS (Payload + Next.js standalone).
# Multi-stage: deps -> build -> runner. Không copy hiacc.db / public/media / .env
# vào image — dữ liệu sống ở volume ngoài image (xem docker-compose.yml).
#
# ⚠️ KHÔNG đặt ENV PAYLOAD_SECRET ở đây với giá trị mặc định "cho tiện build".
# payload.config.ts đã fail-fast khi thiếu biến này lúc RUNTIME — image build
# xong không cần secret thật vì bước `next build` không kết nối DB thực sự
# (chỉ prerender các route không phụ thuộc dữ liệu động lúc build).
# Secret thật chỉ được truyền vào lúc CHẠY container qua .env / docker compose.

FROM node:20-bookworm-slim AS base
WORKDIR /app

# ---- deps: cài toàn bộ dependency (kể cả dev, cần cho build) ----
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---- build: build Next.js ở chế độ standalone ----
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# .dockerignore đã loại hiacc.db, .env*, public/media, node_modules, .next
# nên các thứ đó không lọt vào build context / image.
#
# PAYLOAD_SECRET chỉ cần tồn tại (không cần đúng giá trị thật) để `next build`
# không chết ngay khi payload.config.ts được import lúc build/prerender.
# Đây KHÔNG phải secret production — chỉ dùng nội bộ trong stage build,
# không được COPY hay ENV lại ở stage runner bên dưới.
ENV PAYLOAD_SECRET=build-time-placeholder-khong-dung-that
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- runner: image chạy production, user không phải root ----
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

# Next.js standalone tự gom node_modules cần thiết + server.js.
COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

# ---- Phần chỉ dùng cho `npm run seed` bên trong container ----
# Vì sao phải copy thêm: bản standalone của Next chỉ gom đủ thứ để CHẠY server.
# Nó không có payload CLI, không có mã nguồn TypeScript, nên `npm run seed` sẽ
# báo "command not found" nếu chỉ dựa vào standalone.
#
# Ba mảnh seed cần, thiếu một là hỏng:
#   1. node_modules đầy đủ  — chứa payload CLI + tsx để chạy thẳng file .ts
#   2. src/ + config        — chính mã seed và schema Payload nó import
#   3. seed-assets/         — ẢNH GỐC. public/media bị .dockerignore loại (đúng,
#      vì đó là dữ liệu chạy, thuộc volume). Không có thư mục riêng này thì seed
#      chạy xong mà mọi bài viết không có ảnh bìa.
#
# Đánh đổi: image to thêm (~vài trăm MB do node_modules dev). Chấp nhận được cho
# staging, nơi seed lại nhiều lần đáng giá hơn dung lượng. Bản production không
# cần seed thì build bằng `--target runner-slim` (xem cuối file).
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --chown=nextjs:nodejs package.json tsconfig.json next.config.mjs ./
COPY --chown=nextjs:nodejs src ./src
COPY --chown=nextjs:nodejs seed-assets ./seed-assets

# Seed đọc ảnh từ đường dẫn trong biến này (src/seed/index.ts). Trỏ sẵn vào thư
# mục vừa copy để chạy `npm run seed` trong container không cần truyền thêm gì.
ENV SEED_STOCK_IMAGES_DIR=/app/seed-assets

# Thư mục media phải tồn tại sẵn và ghi được, kể cả trước khi mount volume lần đầu.
RUN mkdir -p /app/public/media && chown -R nextjs:nodejs /app/public/media

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]

# ---- runner-slim: image production, KHÔNG kèm công cụ seed ----
# Dùng khi lên bản thật: `docker build --target runner-slim .`
# Giống hệt `runner` nhưng bỏ node_modules dev + src + ảnh mẫu, nên nhẹ hơn nhiều
# và không mang mã nguồn lẫn ảnh mẫu lên máy chủ của khách.
FROM base AS runner-slim
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

RUN mkdir -p /app/public/media && chown -R nextjs:nodejs /app/public/media

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
