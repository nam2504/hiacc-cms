# Deploy bản staging lên Fly.io (miễn phí) — cho khách duyệt nội dung

Bản này để **khách xem và góp ý**, không phải bản chạy thật.
Production còn phải chốt riêng: đặt máy ở đâu, ai trả tiền, backup ra ngoài
(xem `DEPLOY.md` và mục "Hạ tầng deploy" trong `WORKSTREAMS`).

## Bản staging khác bản thật ở chỗ nào

Bật bằng đúng một biến: `NEXT_PUBLIC_IS_STAGING=true`. Khi bật:

| | Staging | Production |
|---|---|---|
| Dải "Bản dùng thử" trên đầu trang | có | không |
| `robots.txt` | `Disallow: /` | cho bò, chặn `/admin` + `/api` |
| Thẻ `<meta name="robots">` | `noindex, nofollow` | không đặt (cho index) |
| `sitemap.xml` | rỗng | 35 URL |

Vì sao phải chặn: bản nháp đang chạy **nội dung mẫu** (ảnh Unsplash, bài seed,
địa chỉ "Đang cập nhật"). Để Google đánh chỉ mục nó thì khi lên bản thật, hai
bản tranh nhau thứ hạng và khách hàng của khách có thể bị dẫn vào bản nháp.

⚠️ **Lên production nhớ bỏ biến này.** Quên = site thật không lên tìm kiếm được.

## Các bước

### 1. Cài flyctl và đăng nhập

```bash
curl -L https://fly.io/install.sh | sh
export PATH="$HOME/.fly/bin:$PATH"        # thêm vào ~/.bashrc cho lần sau
fly auth signup                            # hoặc: fly auth login
```

Thẻ tín dụng: Fly có hỏi để chống lạm dụng. Gói free vẫn 0đ nếu giữ đúng
1 máy `shared-cpu-1x` 512MB + 3GB volume như `fly.toml` đã đặt sẵn.

### 2. Tạo app + volume

```bash
cd ~/Documents/project/hiacc-cms

fly apps create hiacc-cms-staging          # tên phải khớp dòng `app` trong fly.toml
fly volumes create hiacc_data --region sin --size 1   # 1GB đủ xa cho site nội dung
```

Volume là chỗ sống của `hiacc.db`. Không có nó thì mỗi lần deploy là mất sạch
nội dung khách đã nhập.

### 3. Đặt secret

```bash
fly secrets set PAYLOAD_SECRET=$(openssl rand -hex 32)
```

Chuỗi này ký cookie đăng nhập admin. Đổi nó = mọi phiên admin bị đăng xuất.
Đừng dùng lại chuỗi của máy dev.

### 4. Deploy

```bash
fly deploy
```

Lần đầu mất ~5–8 phút (build image). Xong thì mở:
`https://hiacc-cms-staging.fly.dev`

### 5. Nạp nội dung mẫu

Image đã đóng sẵn công cụ seed (payload CLI + mã nguồn + 17 ảnh mẫu), nên chạy
thẳng trên máy Fly:

```bash
fly ssh console -C "npm run seed"
```

Nạp: 9 bài viết, 7 dịch vụ, 4 trang, 12 chuyên mục, 5 chi nhánh, Settings và
cấu hình tính lương — kèm ảnh bìa.

**Chạy lại bao nhiêu lần cũng được.** Seed idempotent: gặp bản ghi đã có cùng
slug thì bỏ qua, KHÔNG ghi đè. Nội dung khách đã sửa trong `/admin` an toàn.
Ngoại lệ hẹp: bản ghi đã có nhưng field nội dung còn rỗng thì seed điền vào.

### 6. Tạo tài khoản admin

Vào `https://hiacc-cms-staging.fly.dev/admin` — màn hình đầu cho tạo tài khoản
quản trị.

⚠️ **Làm ngay sau khi deploy.** Trang này để trống nghĩa là ai vào trước người
đó thành admin. Đừng gửi link cho khách trước khi tạo xong tài khoản của bạn.

Thứ tự không quan trọng giữa bước 5 và 6 — seed không đụng tới tài khoản người
dùng, và tạo admin không ảnh hưởng nội dung.

## Gửi cho khách

Gửi đúng hai thứ:

1. Link xem site: `https://hiacc-cms-staging.fly.dev`
2. Link quản trị + tài khoản: `https://hiacc-cms-staging.fly.dev/admin`

Nên nói rõ với khách: **ảnh và một số thông tin là dữ liệu mẫu** (dải vàng trên
đầu trang đã ghi sẵn), và hai khối trang chủ (mạng xã hội, bản đồ chi nhánh)
đang ẩn vì chưa có dữ liệu — điền trong `/admin` là hiện ra ngay.

## Vận hành

```bash
fly logs                                   # xem log
fly status                                 # trạng thái máy
fly apps restart hiacc-cms-staging         # khởi động lại
fly deploy                                 # deploy bản mới
```

### Backup DB từ Fly về máy

```bash
fly ssh sftp get /data/hiacc.db ./hiacc-staging-$(date +%Y%m%d).db
```

Làm trước mỗi lần `fly deploy` có đổi schema. Volume của Fly free **không có
snapshot tự động đáng tin** — bản staging mất data thì chỉ mất công nhập lại,
nhưng khi khách đã ngồi nhập nội dung thật vào đây thì phải backup đều.

## Giới hạn phải biết

- **Đúng 1 máy, không được scale.** Mỗi máy Fly có volume riêng → 2 máy là 2 DB
  khác nhau. Chống spam form cũng đếm trong bộ nhớ tiến trình. Muốn nhiều máy
  phải chuyển Postgres + store chung trước.
- **Không tự tắt khi rảnh** (`auto_stop_machines = false`). Để ngủ thì khách bấm
  link phải chờ màn hình trắng ~10–20s, dễ tưởng web hỏng.
- **Free tier không có SLA.** Đây là lý do bản production nên trả tiền.
- **Image staging to hơn bản production** vì kèm node_modules dev + mã nguồn +
  ảnh mẫu để seed được. Lên production build bằng `docker build --target
  runner-slim .` — bỏ hết phần đó, và không mang mã nguồn lẫn ảnh mẫu lên máy
  chủ của khách.
