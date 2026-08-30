'use client'

import { useId, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { t } from '@/lib/i18n'
import styles from './BranchMap.module.css'

/**
 * Bản đồ một chi nhánh — iframe embed từ field `mapUrl` của collection `branches`.
 *
 * Quyết định đã chốt với khách 30/08: dùng iframe embed, KHÔNG Google Maps JS API,
 * KHÔNG API key, KHÔNG script bên thứ ba. Đừng đề xuất đổi lại.
 *
 * Admin hướng dẫn khách dán LINK CHIA SẺ (không phải mã <iframe>), nên phải đổi
 * link đó sang dạng nhúng được — xem toEmbedUrl().
 *
 * Thiếu / không nhận dạng được mapUrl → render null (không iframe rỗng, không báo
 * lỗi), giống cách các khối MXH tự ẩn khi khách chưa điền.
 */

/**
 * Đổi link Google Maps của khách sang URL nhúng được, không cần API key.
 *
 * - Link đã là dạng nhúng (`/maps/embed…`) → giữ nguyên.
 * - Link chia sẻ thường (`google.com/maps/place/…`, `?q=…`, `goo.gl/maps/…`,
 *   `maps.app.goo.gl/…`) → thêm `output=embed`, dạng nhúng công khai của Google.
 * - Host khác Google → null. KHÔNG nhúng URL tuỳ ý người nhập: iframe tới miền lạ
 *   là lỗ hổng, và khách chỉ được hướng dẫn dán link Google Maps.
 */
function toEmbedUrl(raw: string): string | null {
  let url: URL
  try {
    url = new URL(raw.trim())
  } catch {
    return null
  }

  if (url.protocol !== 'https:') return null

  const host = url.hostname.toLowerCase()
  const isGoogleMaps =
    host === 'goo.gl' ||
    host === 'maps.app.goo.gl' ||
    host === 'maps.google.com' ||
    host.endsWith('.google.com') ||
    /^(www\.)?google\.[a-z.]+$/.test(host)

  if (!isGoogleMaps) return null

  if (url.pathname.startsWith('/maps/embed')) return url.toString()

  url.searchParams.set('output', 'embed')
  return url.toString()
}

export function BranchMap({ mapUrl, city }: { mapUrl?: string | null; city?: string | null }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()

  const embedUrl = mapUrl ? toEmbedUrl(mapUrl) : null
  if (!embedUrl) return null

  // Tiêu đề iframe: chuỗi chung qua t() + tên thành phố lấy từ CMS (đã localized).
  const frameTitle = city ? `${t('branches.map.frameTitle')} — ${city}` : t('branches.map.frameTitle')

  return (
    <div className={styles.wrap}>
      {/*
        aria-expanded/aria-controls đặt ở thẻ bọc chứ không truyền vào <Button>:
        Button là API dùng chung của W0, prop của nó không nhận thuộc tính aria
        và gói W7 không được sửa file đó.
      */}
      <div aria-expanded={open} aria-controls={panelId}>
        <Button variant="outline" onClick={() => setOpen((prev) => !prev)}>
          {open ? t('branches.map.hide') : t('branches.map.show')}
        </Button>
      </div>

      {/* Mở tại chỗ (accordion) để khách không phải rời site. */}
      {open && (
        <div className={styles.frame} id={panelId}>
          <iframe
            className={styles.iframe}
            src={embedUrl}
            title={frameTitle}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      )}
    </div>
  )
}
