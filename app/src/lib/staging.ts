/**
 * Cờ "đây là bản nháp cho khách duyệt", không phải bản chạy thật.
 *
 * Bản staging dùng NỘI DUNG MẪU (ảnh Unsplash, bài seed, "Đang cập nhật").
 * Để Google đánh chỉ mục bản này là tự bắn vào chân: khi lên production, hai
 * bản cùng nội dung sẽ tranh nhau thứ hạng, và kết quả tìm kiếm có thể trỏ
 * khách hàng của khách sang bản nháp.
 *
 * Bật bằng biến môi trường `NEXT_PUBLIC_IS_STAGING=true` lúc deploy — KHÔNG
 * suy ra từ tên miền hay NODE_ENV: production cũng chạy NODE_ENV=production,
 * và tên miền thì đổi được mà không ai nhớ sửa code.
 *
 * Tiền tố NEXT_PUBLIC_ là bắt buộc: giá trị phải có mặt cả lúc build (banner
 * render trong component) lẫn lúc chạy.
 */
export const IS_STAGING = process.env.NEXT_PUBLIC_IS_STAGING === 'true'
