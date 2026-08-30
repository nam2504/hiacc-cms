import { notFound } from 'next/navigation'

/**
 * Bắt mọi URL không khớp route nào của phần public, để nó rơi vào not-found.tsx
 * của (site) — tức là CÓ Header/Footer, khách lạc vào vẫn điều hướng tiếp được.
 *
 * Không có route này thì Next dùng trang 404 mặc định nằm ngoài mọi layout
 * (dự án không có root layout: (site) và (payload) mỗi bên tự dựng <html>).
 *
 * Vẫn trả đúng HTTP 404 — site cũ trả 200 cho trang 404 làm Google index rác,
 * xem AUDIT §5.1.
 */
export default function CatchAllNotFound() {
  notFound()
}
