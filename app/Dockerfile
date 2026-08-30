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

# Thư mục media phải tồn tại sẵn và ghi được, kể cả trước khi mount volume lần đầu.
RUN mkdir -p /app/public/media && chown -R nextjs:nodejs /app/public/media

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
