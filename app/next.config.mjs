import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output gọn cho Docker: gom node_modules cần thiết + server vào .next/standalone,
  // image production không cần copy toàn bộ node_modules. Chỉ thêm dòng này (W8),
  // không đụng phần `images` do W6 cấu hình.
  output: 'standalone',
  images: {
    /**
     * Ảnh do Payload phục vụ từ đĩa nội bộ (Media.upload.staticDir = public/media),
     * nên URL luôn là đường dẫn TƯƠNG ĐỐI cùng origin — không cần remotePatterns.
     * `localPatterns` là danh sách trắng bắt buộc của Next 16 cho ảnh nội bộ:
     * thiếu nó thì /_next/image trả 400 cho mọi ảnh media.
     *
     * Đây là khoản nợ kỹ thuật INTERFACE §7.3 mà W3 để lại.
     */
    localPatterns: [
      { pathname: '/api/media/**' },
      { pathname: '/media/**' },
    ],
    formats: ['image/webp'],
  },
}

export default withPayload(nextConfig)
