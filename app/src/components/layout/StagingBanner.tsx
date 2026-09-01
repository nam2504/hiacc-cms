import { isStaging } from '@/lib/staging'

/**
 * Dải báo "bản dùng thử" trên đầu mọi trang public.
 *
 * Lý do có nó: bản staging đang chạy NỘI DUNG MẪU (ảnh Unsplash, bài seed,
 * địa chỉ "Đang cập nhật"). Khách mở link mà không có nhãn nào rất dễ tưởng
 * đây là bản giao cuối rồi báo lỗi về những thứ vốn đã biết là tạm.
 *
 * Không render gì ở bản production — kiểm tra ngay tại đây để nơi gọi
 * (layout) không phải biết đến cờ staging.
 *
 * Màu: KHÔNG dùng đỏ thương hiệu `#CC1420` (brand.ts) — đỏ đó là màu của
 * khách, dùng cho dải cảnh báo tạm sẽ làm bẩn nhận diện. Dùng vàng cảnh báo,
 * là quy ước ai cũng đọc được mà không cần chú thích.
 */
export function StagingBanner() {
  if (!isStaging()) return null

  return (
    <div
      role="status"
      style={{
        background: '#fef3c7',
        borderBottom: '1px solid #f59e0b',
        color: '#78350f',
        padding: '0.5rem 1rem',
        textAlign: 'center',
        fontSize: '0.875rem',
        lineHeight: 1.5,
      }}
    >
      <strong>Bản dùng thử để duyệt nội dung.</strong>{' '}
      Một số hình ảnh và thông tin là dữ liệu mẫu, chưa phải nội dung chính thức.
    </div>
  )
}
