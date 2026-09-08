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

# NEXT_PUBLIC_* phải có mặt LÚC BUILD, không chỉ lúc chạy: Next đóng băng giá
# trị của chúng vào HTML những trang được prerender. Thiếu ở đây thì canonical
# và ảnh OG của các trang đó trỏ về http://localhost:3000 (giá trị fallback
# trong src/lib/seo.ts) — dán link vào Zalo/Facebook không ra preview, mà build
# vẫn thành công nên không ai phát hiện.
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_SERVER_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL

# Cờ staging cũng phải có mặt lúc BUILD, không chỉ lúc chạy.
# Next prerender sẵn robots.txt, sitemap.xml và trang chủ thành file tĩnh
# ngay trong `npm run build`; lúc chạy nó chỉ phục vụ lại các file đó, không
# gọi lại code. Nên nếu chỉ đặt IS_STAGING ở biến lúc chạy thì robots.txt
# vẫn là bản "Allow: /" đã nướng vào image — đã đo thật, cả 4 lớp chặn index
# đều im lặng không hoạt động trong khi deploy vẫn báo thành công.
#
# Build production KHÔNG truyền ARG này => giá trị rỗng => mọi thứ y như cũ.
ARG IS_STAGING
ENV IS_STAGING=$IS_STAGING

# Cờ tắt RIÊNG dải nhãn "bản dùng thử" (giữ nguyên noindex). Cùng lý do
# build-time như IS_STAGING: trang chủ prerender, thiếu ARG là nhãn vẫn hiện
# dù fly.toml [env] có đặt.
ARG SHOW_STAGING_BANNER
ENV SHOW_STAGING_BANNER=$SHOW_STAGING_BANNER

RUN npm run build

# ⚠️ THỨ TỰ STAGE CÓ Ý NGHĨA: `docker build` không kèm `--target` sẽ dựng stage
# CUỐI CÙNG trong file. `runner` (kèm công cụ seed) phải nằm cuối để `fly deploy`
# và `docker compose build` lấy đúng nó. Production gọn thì chỉ định rõ:
#     docker build --target runner-slim .

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

RUN rm -f /app/.env

# Bản gọn vẫn phải chạy được migration: DB mới toanh không có bảng nào, vì
# Payload chỉ tự tạo bảng khi NODE_ENV != production.
#
# ⚠️ ĐỪNG cherry-pick vài thư mục trong node_modules (payload + tsx + .bin).
# Đã thử: `payload migrate` chết ngay với "Cannot find package 'croner'" —
# payload kéo theo cả một cây phụ thuộc, vá từng gói một sẽ lòi ra gói thiếu
# tiếp theo mãi không hết, và lỗi chỉ xuất hiện lúc CHẠY trên máy chủ khách
# chứ không phải lúc build.
#
# Thay vào đó copy toàn bộ node_modules rồi để npm tự cắt phần dev — npm biết
# chính xác gói nào là phụ thuộc thật, mình thì không.
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --chown=nextjs:nodejs package.json tsconfig.json ./
# Cả src/, không phải chỉ payload.config.ts + migrations.
# Đã thử cắt nhỏ: chết với "Cannot find module '/app/src/collections/Users'" —
# payload.config.ts import toàn bộ collections và globals, nên tách ra là hỏng.
# src/ chỉ là mã nguồn TypeScript (~1MB), không đáng để tối ưu; ảnh mẫu
# (seed-assets/) mới nặng và vẫn chỉ nằm ở stage `runner`.
COPY --chown=nextjs:nodejs src ./src
COPY --chown=nextjs:nodejs next.config.mjs ./next.config.mjs
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./docker-entrypoint.sh

# Cắt phụ thuộc dev SAU khi đã có đủ cây: giữ lại đúng những gì production cần
# (gồm cả cây phụ thuộc của payload để `payload migrate` chạy được).
RUN npm prune --omit=dev && npm cache clean --force

RUN mkdir -p /app/public/media && chown -R nextjs:nodejs /app/public/media

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "server.js"]

# ---- runner: image chạy production, user không phải root ----
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

# Next.js standalone tự gom node_modules cần thiết + server.js.
# ⚠️ THỨ TỰ QUAN TRỌNG: node_modules của `deps` (đầy đủ, cho seed) phải copy
# TRƯỚC, rồi mới tới bản standalone. Docker COPY là merge, file trùng thì bản
# copy sau thắng — mà bản standalone là bản Next đã tree-shake và vá sẵn
# (@libsql, sharp), nên nó phải là bản thắng. Đảo ngược lại thì image mang hai
# cây `next` chồng nhau (~1.7GB thay vì ~500MB) và máy 512MB dễ OOM lúc deploy.
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

# `next build` tự sinh .next/standalone/.env từ .env của máy build. .dockerignore
# đã chặn .env khỏi build context nên hiện không có gì lọt vào, nhưng nếu ai đó
# build với context khác thì file này sẽ mang DATABASE_URI và PAYLOAD_SECRET của
# máy dev vào image — và nó GHI ĐÈ biến môi trường truyền lúc chạy, khiến app
# ghi vào DB sai chỗ mà không báo lỗi. Xoá cho chắc.
RUN rm -f /app/.env

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
COPY --chown=nextjs:nodejs package.json tsconfig.json next.config.mjs ./
COPY --chown=nextjs:nodejs src ./src
COPY --chown=nextjs:nodejs seed-assets ./seed-assets
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./docker-entrypoint.sh

# Seed đọc ảnh từ đường dẫn trong biến này (src/seed/index.ts). Trỏ sẵn vào thư
# mục vừa copy để chạy `npm run seed` trong container không cần truyền thêm gì.
ENV SEED_STOCK_IMAGES_DIR=/app/seed-assets

# Thư mục media phải tồn tại sẵn và ghi được, kể cả trước khi mount volume lần đầu.
RUN mkdir -p /app/public/media && chown -R nextjs:nodejs /app/public/media

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Migration chạy trước server — xem docker-entrypoint.sh.
ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "server.js"]
