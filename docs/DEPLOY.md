# DEPLOY.md — hướng dẫn vận hành HiACC CMS (cho dev)

Tài liệu này viết cho người triển khai / bảo trì server, không phải cho khách
dùng CMS (xem `docs/HUONG-DAN-KHACH.md` cho phần đó).

Hạ tầng: Docker + docker compose, **trung lập nhà cung cấp** — chạy được trên
bất kỳ VPS Linux nào có Docker. Bản đầu dùng SQLite (xem mục 5 để đổi Postgres
sau này).

---

## 1. Cài lần đầu trên VPS trắng

### 1.1 Cài Docker

```bash
docker compose version
# nếu báo "unknown command" hoặc chưa cài Docker: cài theo hướng dẫn chính thức
# https://docs.docker.com/engine/install/ rồi chạy lại lệnh trên để xác nhận.
```

### 1.2 Lấy source

```bash
git clone <url-repo-cua-ban> hiacc-cms
cd hiacc-cms
```

### 1.3 Tạo file môi trường

```bash
cp app/.env.example app/.env
```

Sửa `app/.env`:
- `DATABASE_URI` — để nguyên `file:./hiacc.db`, **docker-compose.yml sẽ tự
  ghi đè** thành `file:/data/hiacc.db` lúc chạy trong container (khớp volume
  `./data:/data`). Giá trị trong `.env` chỉ áp dụng khi chạy `npm run dev`
  ngoài container.
- `PAYLOAD_SECRET` — **bắt buộc**, sinh một chuỗi ngẫu nhiên riêng cho môi
  trường này:
  ```bash
  openssl rand -hex 32
  ```
  Dán giá trị vào `PAYLOAD_SECRET=` trong `app/.env`. **Không dùng lại** chuỗi
  đã dùng ở máy dev hay môi trường khác.
- `NEXT_PUBLIC_SERVER_URL` — địa chỉ Payload dùng cho **trang admin và link
  trong email** (ví dụ link đặt lại mật khẩu). Đặt bằng domain thật, có
  `https://`, ví dụ `https://cms.hiacc.com.vn` (nếu admin chạy trên subdomain
  riêng) hoặc `https://hiacc.com.vn` (nếu admin chung domain với site).
- `NEXT_PUBLIC_SITE_URL` — domain công khai của **website**, dùng cho
  `robots.txt`, `sitemap.xml`, thẻ `canonical`, ảnh chia sẻ Facebook/Zalo (Open
  Graph) và JSON-LD. Ví dụ `https://hiacc.com.vn`.

  ⚠️ **Hai biến trên KHÔNG phải là một, dù thường trỏ cùng một domain.**
  `NEXT_PUBLIC_SERVER_URL` là "địa chỉ của hệ thống Payload" (admin, email).
  `NEXT_PUBLIC_SITE_URL` là "địa chỉ công khai của website" (SEO, chia sẻ
  mạng xã hội). Nếu sau này tách admin ra subdomain riêng
  (`cms.hiacc.com.vn`) trong khi site chính vẫn ở `hiacc.com.vn`, hai biến
  này sẽ khác nhau — đổi nhầm biến sẽ làm sai link trong email hoặc sai
  domain trong sitemap/OG mà không có lỗi rõ ràng nào báo ra.

### 1.4 Build và chạy

```bash
docker compose build
docker compose up -d
```

Kiểm tra:
```bash
curl -s -o /dev/null -w "%{http_code}\n" localhost:3000/        # kỳ vọng 200
curl -s -o /dev/null -w "%{http_code}\n" localhost:3000/admin   # kỳ vọng 200
```

Nếu cổng 3000 đã bị chiếm trên máy này, đổi cổng host mà không cần sửa file:
```bash
HOST_PORT=3300 docker compose up -d
```

### 1.5 Tạo admin đầu tiên

Lần đầu vào `http://<domain>/admin` (hoặc `http://<domain>:<HOST_PORT>/admin`),
Payload sẽ hiện form tạo tài khoản admin đầu tiên — điền email/mật khẩu thật
của bạn. **Đổi ngay sau khi tạo xong**, đừng dùng mật khẩu mẫu.

### 1.6 Nạp nội dung mẫu (tuỳ chọn, cho lần cài đầu trống dữ liệu)

Seed chạy **trong container**, không chạy trên host (host không có
`DATABASE_URI` trỏ đúng volume container):

```bash
docker compose exec app node -e "
  process.env.DATABASE_URI = 'file:/data/hiacc.db'
" # (tham khảo — xem ghi chú dưới)
```

> ⚠️ **Chưa verify được lệnh seed-trong-container ở gói này.** Ảnh runner
> dùng `output: 'standalone'` không có sẵn `node_modules/.bin/payload` hay
> script `npm run seed` (standalone output chỉ gom phần cần cho `next start`,
> không gom CLI `payload run`). Nếu cần seed trên VPS, cách chắc ăn nhất đã
> thử được ở gói này là seed **trước khi build image** (chạy `npm run seed`
> trên máy dev với `DATABASE_URI` trỏ vào `./data/hiacc.db` của server đích,
> hoặc copy file `hiacc.db` đã seed sẵn từ máy dev vào `./data/hiacc.db` của
> server qua `scp` trước lần `docker compose up -d` đầu tiên). Việc thêm một
> stage/script seed chạy được bên trong container đứng ngoài phạm vi sở hữu
> file của gói này (không được sửa `Dockerfile` để bundle thêm CLI của
> Payload mà không có yêu cầu rõ) — ghi nhận làm nợ kỹ thuật, xem báo cáo W8
> mục 7.

---

## 2. Đặt HTTPS trước app (reverse proxy)

Container chỉ phục vụ HTTP nội bộ ở cổng 3000 (hoặc `HOST_PORT`). Đặt
nginx/Caddy phía trước để có HTTPS. Mẫu, **không bắt buộc chọn công cụ này**:

### 2.1 Caddy (tự động lấy chứng chỉ, ít cấu hình nhất)

`Caddyfile`:
```
hiacc.com.vn {
    reverse_proxy localhost:3000
}
```
```bash
caddy run --config Caddyfile
```

### 2.2 nginx + certbot

`/etc/nginx/sites-available/hiacc`:
```nginx
server {
    listen 80;
    server_name hiacc.com.vn;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
```bash
sudo ln -s /etc/nginx/sites-available/hiacc /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d hiacc.com.vn
```

> Chưa verify được mục 2 trong gói này — không có domain thật + máy verify
> không có quyền mở cổng 80/443 ra Internet. Đây là cấu hình mẫu chuẩn, cần
> người vận hành tự chạy thử trên VPS thật.

---

## 3. Deploy bản mới và rollback

### 3.1 Deploy bản mới

```bash
git pull
docker compose build
docker compose up -d
```
`docker compose up -d` chỉ recreate container nào có image mới — container
cũ dừng, container mới lên, volume (`./data`, `./media`) giữ nguyên vì nó
không nằm trong image.

### 3.2 Rollback

Cách chắc ăn nhất khi không dùng registry tag: quay lại commit cũ rồi build lại.
```bash
git log --oneline -5      # tìm commit trước lần deploy hỏng
git checkout <commit-cu>
docker compose build
docker compose up -d
```
Nếu có push image lên registry với tag theo version, rollback nhanh hơn bằng
cách đổi `image:` trong `docker-compose.yml` về tag cũ rồi `docker compose up -d`
— việc gắn registry/CI không nằm trong phạm vi gói này.

---

## 4. Backup định kỳ + restore

### 4.1 Backup thủ công

```bash
./scripts/backup.sh
# hoặc chỉ định thư mục đích khác:
./scripts/backup.sh /path/to/backups
```
Tạo file `backups/hiacc-backup-<ngày-giờ>.tar.gz` gồm `hiacc.db` + toàn bộ
thư mục media.

### 4.2 Cron mẫu (backup hằng ngày lúc 2h sáng)

```cron
0 2 * * * cd /path/to/hiacc-cms && ./scripts/backup.sh >> /var/log/hiacc-backup.log 2>&1
```
Nên thêm dọn backup cũ (ví dụ giữ 14 bản gần nhất) — chưa có script dọn tự
động trong gói này, tự thêm `find backups/ -mtime +14 -delete` nếu cần.

### 4.3 Restore

```bash
./scripts/restore.sh backups/hiacc-backup-20260830-160320.tar.gz
```
Script tự dừng app, ghi đè `./data/hiacc.db` + `./media/`, rồi khởi động lại.
**Ghi đè dữ liệu hiện tại** — chỉ chạy khi chắc chắn muốn quay lại bản backup.

---

## 5. Đổi SQLite sang Postgres khi cần scale

Bản đầu dùng SQLite (quyết định 30/08 — site nội dung tĩnh, traffic thấp,
backup = copy 1 file). Đường đổi sang Postgres đã được giữ sẵn:

1. Cài thêm adapter: trong `app/`, `npm install @payloadcms/db-postgres`.
2. Trong `app/src/payload.config.ts`, đổi **một dòng**:
   ```ts
   // từ:
   db: sqliteAdapter({ client: { url: process.env.DATABASE_URI || 'file:./hiacc.db' } }),
   // thành:
   db: postgresAdapter({ pool: { connectionString: process.env.DATABASE_URI } }),
   ```
   và đổi import `sqliteAdapter` → `postgresAdapter` từ `@payloadcms/db-postgres`.
   (File này thuộc sở hữu W8 chỉ ở phần adapter — nếu người thực hiện việc
   này không phải W8, xin xem lại quyền sửa file theo contract hiện hành.)
3. Trong `docker-compose.yml`, bỏ comment khối `postgres:` ở cuối file, đổi
   mật khẩu mẫu, và thêm `depends_on: [postgres]` vào service `app`.
4. Đổi `DATABASE_URI` trong `app/.env` thành chuỗi kết nối Postgres, ví dụ
   `postgresql://hiacc:matkhau@postgres:5432/hiacc_cms`.
5. Migrate dữ liệu cũ từ SQLite sang Postgres — Payload có công cụ export/import
   riêng theo phiên bản, đọc docs chính thức của Payload lúc thực hiện (ngoài
   phạm vi đã verify của gói này).

> Chưa verify được mục 5 (không cài Postgres thử trong gói này — SQLite là
> quyết định chốt cho bản đầu, xem contract §1.2). Đây là hướng dẫn theo tài
> liệu Payload, chưa chạy thật.

---

## 6. Xử lý sự cố hay gặp

### 6.1 Mất quyền ghi thư mục media

Triệu chứng: upload ảnh trong `/admin` báo lỗi, hoặc ảnh mới không hiện.
```bash
# Trên host, thư mục ./media phải ghi được bởi user chạy trong container (uid 1001):
ls -ld media
chown -R 1001:1001 media    # hoặc chmod 775 media nếu không đổi được owner
docker compose restart app
```

### 6.2 Mất `PAYLOAD_SECRET` / cần đổi

**Đổi `PAYLOAD_SECRET` sẽ làm mất mọi phiên đăng nhập admin đang mở** — mọi
người phải đăng nhập lại. Đây là hệ quả bắt buộc của cách ký cookie, không
phải lỗi. Nếu bạn thật sự làm mất giá trị cũ và không thể khôi phục, tạo
giá trị mới và chấp nhận việc mọi người phải đăng nhập lại:
```bash
openssl rand -hex 32   # dán vào PAYLOAD_SECRET trong app/.env
docker compose up -d   # recreate container để đọc .env mới
```

Nếu **thiếu hẳn** `PAYLOAD_SECRET` (biến rỗng hoặc chưa set): mọi route chạm
tới Payload (`/admin`, `/api/*`) sẽ trả lỗi 500 và log container in ra:
```
⨯ Error: PAYLOAD_SECRET chưa được đặt. Thêm vào .env (hoặc biến môi trường
của môi trường deploy) một chuỗi ngẫu nhiên dài, ví dụ sinh bằng:
openssl rand -hex 32
```
⚠️ Lưu ý hành vi thật đã verify ở gói này (khác với suy đoán ban đầu):
container **không tự thoát/crash toàn bộ** khi thiếu secret — các route
**tĩnh** của site public (`/`, `/dich-vu`, v.v., không chạm DB qua Payload
API lúc runtime) vẫn có thể trả 200, `docker ps` vẫn báo "Up (healthy)" vì
healthcheck chỉ gọi `/`. Chỉ route nào thực sự chạm `payload.config.ts`
(mọi thứ dưới `/admin`, `/api/*`) mới lộ lỗi 500 kèm thông báo trên trong
log. Vì vậy: **khi thấy `/admin` hoặc form liên hệ lỗi 500 dù trang chủ vẫn
chạy, kiểm tra `docker compose logs app` trước tiên — rất có thể thiếu
`PAYLOAD_SECRET`.**

Xem thêm log real-time:
```bash
docker compose logs -f app
```

### 6.3 Quên mật khẩu admin

Chưa cấu hình email adapter thật (log build cảnh báo "No email adapter
provided" — email được ghi ra console thay vì gửi thật). Vì vậy chức năng
"quên mật khẩu" qua email **chưa hoạt động** cho tới khi có gói cấu hình
SMTP/email adapter riêng (ngoài phạm vi gói này — ghi nhận nợ kỹ thuật ở
báo cáo W8 mục 7). Cách khôi phục tạm thời: tạo admin mới trực tiếp trong
DB hoặc nhờ dev có quyền `docker compose exec` chạy script Payload để reset
mật khẩu qua Local API.
