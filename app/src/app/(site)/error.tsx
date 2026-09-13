'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import { t } from '@/lib/i18n'
import { logger } from '@/lib/observability/logger'

/**
 * Bắt lỗi render runtime trong (site) — không có file này thì lỗi 1 component
 * (vd dữ liệu CMS dạng lạ) làm cả trang trắng thay vì hiện thông báo + Header/Footer.
 *
 * Bắt buộc là Client Component (quy định của Next.js `error.tsx`), nên không
 * gọi được `getRequestLocale()` (server-only) — dùng `t` mặc định DEFAULT_LOCALE.
 */
export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logger.error('[site] render error', error)
  }, [error])

  return (
    <Section title={t('error.generic.title')} subtitle={t('error.generic.body')}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Button onClick={reset}>{t('error.generic.retry')}</Button>
      </div>
    </Section>
  )
}
