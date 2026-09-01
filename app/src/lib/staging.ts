/**
 * Cờ "đây là bản nháp cho khách duyệt", không phải bản chạy thật.
 *
 * Bản staging dùng NỘI DUNG MẪU (ảnh Unsplash, bài seed, "Đang cập nhật").
 * Để Google đánh chỉ mục bản này là tự bắn vào chân: khi lên production, hai
 * bản cùng nội dung sẽ tranh nhau thứ hạng, và kết quả tìm kiếm có thể trỏ
 * khách hàng của khách sang bản nháp.
 *
 * Bật bằng biến môi trường `IS_STAGING=true` lúc chạy.
 *
 * ⚠️ KHÔNG đặt tên biến là `NEXT_PUBLIC_IS_STAGING`. Next thay biến
 * `NEXT_PUBLIC_*` bằng GIÁ TRỊ CỨNG ngay lúc `next build`, nên đặt nó ở
 * `[env]` của fly.toml (vốn là biến lúc CHẠY) sẽ không có tác dụng gì —
 * banner không hiện, noindex không bật, mà build vẫn thành công nên không
 * ai biết. Đã đo thật: chạy container với NEXT_PUBLIC_IS_STAGING=true cho
 * ra robots.txt "Allow: /".
 *
 * Không có tiền tố thì đây là biến phía máy chủ, đọc lúc chạy. Cả ba nơi
 * dùng nó (robots.ts, sitemap.ts, layout.tsx generateMetadata) đều chạy trên
 * máy chủ nên đọc được.
 *
 * ⚠️ Cũng vì thế, KHÔNG được dùng cờ này trong Client Component
 * ('use client') — ở đó `process.env` rỗng và cờ sẽ luôn là false.
 * StagingBanner là Server Component, đúng yêu cầu.
 *
 * Đọc trong hàm chứ không phải hằng ở tầng module: hằng bị "đóng băng" theo
 * lần đầu module được nạp. Gọi hàm đảm bảo mỗi lần render đều đọc lại.
 *
 * ⚠️ QUAN TRỌNG — bỏ tiền tố NEXT_PUBLIC_ là CẦN nhưng CHƯA ĐỦ.
 * robots.txt, sitemap.xml và trang chủ được Next prerender thành file tĩnh
 * ngay trong `next build`; lúc chạy nó phục vụ lại file đó chứ không gọi lại
 * hàm này. Nên IS_STAGING PHẢI được truyền cả lúc BUILD (ARG trong Dockerfile
 * + [build.args] trong fly.toml), không chỉ lúc chạy.
 *
 * Đã đo thật: chạy container với IS_STAGING=true mà build không có cờ cho ra
 * robots.txt "Allow: /", không banner, sitemap đủ 6 URL — im lặng hoàn toàn.
 *
 * Vẫn giữ biến lúc chạy vì trang render động cần nó. Đổi cờ thì đổi cả hai chỗ.
 * Build production không truyền ARG => cờ rỗng => hành vi không đổi.
 */
export function isStaging(): boolean {
  return process.env.IS_STAGING === 'true'
}
