# Nguồn ảnh stock — dữ liệu test (gói M1)

Toàn bộ ảnh dưới đây là **ảnh mẫu** dùng để dựng giao diện/demo, KHÔNG phải ảnh chính thức
của HiACC. Trường `alt` của mỗi ảnh kết thúc bằng ` [Ảnh mẫu]` để nhận ra trong admin.
Khi bàn giao nội dung thật, xoá theo danh sách filename dưới đây.

Tất cả ảnh lấy từ **Unsplash** (unsplash.com) — giấy phép Unsplash License: miễn phí cho
mục đích thương mại và phi thương mại, không bắt buộc ghi công. Bảng dưới vẫn ghi tác giả
đầy đủ để minh bạch và làm bằng chứng nguồn gốc.

Không ảnh nào trong danh sách có mặt người ở vị trí gợi ý là nhân viên/khách hàng HiACC:
ưu tiên bàn làm việc, văn phòng, đồ vật, biểu đồ — không có ảnh chân dung/cận mặt.

| filename (trong `media`)         | Nguồn (URL)                                                   | Tác giả              | Giấy phép         |
|-----------------------------------|----------------------------------------------------------------|-----------------------|--------------------|
| hiacc-stock-laptop-desk.jpg       | https://unsplash.com/photos/photo-1487017159836-4e23ece2e4cf   | Luca Bravo            | Unsplash License   |
| hiacc-stock-desk-window.jpg       | https://unsplash.com/photos/photo-1497215728101-856f4ea42174   | Alesia Kazantceva     | Unsplash License   |
| hiacc-stock-office-hallway.jpg    | https://unsplash.com/photos/photo-1497366754035-f200968a6e72   | Nastuh Abootalebi     | Unsplash License   |
| hiacc-stock-keyboard-coffee.jpg   | https://unsplash.com/photos/photo-1518655048521-f130df041f66   | Leone Venter          | Unsplash License   |
| hiacc-stock-desk-lamp.jpg         | https://unsplash.com/photos/photo-1519219788971-8d9797e0928e   | Andrej Lišakov        | Unsplash License   |
| hiacc-stock-clock-plant.jpg       | https://unsplash.com/photos/photo-1542435503-956c469947f6      | Jess Bailey           | Unsplash License   |
| hiacc-stock-imac-desk.jpg         | https://unsplash.com/photos/photo-1549637642-90187f64f420      | kate.sade             | Unsplash License   |
| hiacc-stock-glasses-notebook.jpg  | https://unsplash.com/photos/photo-1551434678-e076c223a692      | Tim van der Kuip      | Unsplash License   |
| hiacc-stock-office-cubicles.jpg   | https://unsplash.com/photos/photo-1571624436279-b272aff752b5   | S O C I A L . C U T   | Unsplash License   |
| hiacc-stock-finance-chart.jpg     | https://unsplash.com/photos/photo-1618044733300-9472054094ee   | Markus Spiske         | Unsplash License   |

Xem cách gắn từng ảnh vào bản ghi nào (bài viết / trang) trong `app/src/seed/data.ts`
(mảng `POST_IMAGES`) và `app/src/seed/index.ts` (bước nạp media qua Payload Local API).

## Ảnh rác đã phát hiện (không thuộc danh sách trên)

`Screenshot from 2026-08-30 05-49-29.png` (media id=1) là ảnh chụp màn hình lẫn vào, không
phải ảnh stock hợp lệ — xem báo cáo gói M1 để biết đề xuất xử lý (chờ PM quyết, không tự xoá).
| hiacc-stock-svc-ledger.jpg        | https://unsplash.com/photos/photo-1554224155-6726b3ff858f   | Scott Graham          | Unsplash License   |
| hiacc-stock-svc-folders.jpg       | https://unsplash.com/photos/photo-1568667256549-094345857637 | Maksym Kaharlytskyi   | Unsplash License   |
| hiacc-stock-svc-magnifier.jpg     | https://unsplash.com/photos/photo-1450101499163-c8848c66ca85 | Bench Accounting      | Unsplash License   |
| hiacc-stock-svc-calculator.jpg    | https://unsplash.com/photos/photo-1554224154-26032ffc0d07   | Scott Graham          | Unsplash License   |
| hiacc-stock-svc-coins.jpg         | https://unsplash.com/photos/photo-1526304640581-d334cdbbf45e | Micheile Henderson    | Unsplash License   |
| hiacc-stock-svc-archive.jpg       | https://unsplash.com/photos/photo-1541746972996-4e0b0f43e02a | Alex Kotliarskyi      | Unsplash License   |
| hiacc-stock-svc-report.jpg        | https://unsplash.com/photos/photo-1543286386-713bdd548da4   | Carlos Muza           | Unsplash License   |

## Ảnh dịch vụ (7 ảnh, thêm 30/08 khi bổ sung field `services.image`)

Bảy dòng cuối bảng trên là ảnh minh hoạ cho 7 dịch vụ. Cùng quy tắc: Unsplash License,
`alt` kết thúc ` [Ảnh mẫu]`, không ảnh chân dung.
