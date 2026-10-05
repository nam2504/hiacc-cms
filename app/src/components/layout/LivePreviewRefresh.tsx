'use client'

import { RefreshRouteOnSave } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

/**
 * Khung "Live Preview" trong admin (Settings → nút Live Preview) nhúng chính site
 * trong một iframe. Admin bấm Save → Payload gửi postMessage → component này gọi
 * router.refresh() để iframe tải lại dữ liệu mới, không phải F5 tay.
 *
 * Chỉ gắn khi trang ĐANG nằm trong iframe: khách thường vào site không cần lắng
 * nghe gì cả. serverURL = origin hiện tại vì admin và site chạy cùng một app
 * (hitax.com.vn/admin nhúng hitax.com.vn/) — RefreshRouteOnSave bỏ qua message
 * từ origin khác.
 *
 * Settings chưa bật drafts, nên Save là lên site thật luôn — khung này cho xem
 * kết quả ngay sau khi lưu, không phải bản nháp trước khi lưu.
 */
export function LivePreviewRefresh() {
  const router = useRouter()
  const [origin, setOrigin] = useState<string | null>(null)

  useEffect(() => {
    if (window.self !== window.top) setOrigin(window.location.origin)
  }, [])

  if (!origin) return null
  return <RefreshRouteOnSave refresh={() => router.refresh()} serverURL={origin} />
}
