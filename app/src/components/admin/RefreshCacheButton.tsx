'use client'

import { Button } from '@payloadcms/ui'
import { useState } from 'react'

/**
 * Nút "Làm mới cache" ở đầu trang Cấu hình chung.
 *
 * Vì sao cần: các trang public dùng ISR 10 phút (`revalidate = 600`) để click
 * menu không phải chờ render lại — đổi lại, nội dung khách vừa sửa có thể chậm
 * tới 10 phút mới hiện. Không có nút này thì khách sửa xong, mở web, thấy y như
 * cũ và tưởng là hỏng.
 */
export function RefreshCacheButton() {
  const [state, setState] = useState<'idle' | 'running' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function refresh() {
    setState('running')
    setMessage('')
    try {
      const res = await fetch('/api/lam-moi-cache', { method: 'POST' })
      const data = (await res.json()) as { message?: string }
      if (!res.ok) throw new Error(data?.message || `Lỗi ${res.status}`)
      setState('done')
      setMessage(data?.message || 'Đã làm mới cache.')
    } catch (error) {
      setState('error')
      setMessage(error instanceof Error ? error.message : 'Không làm mới được cache.')
    }
  }

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <Button buttonStyle="secondary" onClick={refresh} disabled={state === 'running'}>
        {state === 'running' ? 'Đang làm mới…' : 'Làm mới cache website'}
      </Button>
      <p
        style={{
          margin: '0.5rem 0 0',
          fontSize: '0.85rem',
          color: state === 'error' ? 'var(--theme-error-500)' : 'var(--theme-elevation-600)',
        }}
      >
        {message ||
          'Website hiển thị bản đã lưu, làm mới mỗi 10 phút. Bấm nút này để nội dung vừa sửa hiện ra ngay.'}
      </p>
    </div>
  )
}

export default RefreshCacheButton
