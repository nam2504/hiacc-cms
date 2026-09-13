'use client'

import { TextField, useField } from '@payloadcms/ui'
import type { TextFieldClientComponent } from 'payload'

/**
 * Ô "Màu nền chân trang" trong Cấu hình chung — cùng kiểu bảng màu bấm chọn với
 * "Màu chủ đạo" (`PrimaryColorField.tsx`), tách file riêng vì hai field khác
 * `path`/mô tả và không có prop `tenantBrand` (footer không có "màu logo mặc
 * định" để đưa lên đầu bảng).
 *
 * Vẫn ghi vào field `footerBg` dưới dạng chuỗi `#RRGGBB` đúng định dạng
 * `lib/brandStyle.ts` đọc được. Màu chữ chân trang (đen/trắng) tự tính theo độ
 * sáng của màu này ở `footerStyle()` — bảng màu dưới đây vì vậy không giới hạn
 * riêng tông sáng hay tối.
 */

const HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

const SWATCHES: { value: string; label: string }[] = [
  { value: '#F6D9DE', label: 'Hồng phấn' },
  { value: '#FDF2E9', label: 'Kem' },
  { value: '#E8F0FE', label: 'Xanh dương nhạt' },
  { value: '#E6F4EA', label: 'Xanh lá nhạt' },
  { value: '#F3F0FF', label: 'Tím nhạt' },
  { value: '#F5F5F4', label: 'Xám nhạt' },
  { value: '#1F4141', label: 'Xanh rêu đậm' },
]

const normalize = (raw: unknown) => (typeof raw === 'string' ? raw.trim() : '')

/** `#abc` → `#aabbcc`, để ô chọn màu (chỉ hiểu 6 ký tự) hiện đúng màu đang lưu. */
const toSixDigits = (value: string) => {
  if (!HEX.test(value)) return null
  if (value.length === 7) return value.toLowerCase()
  const [, r, g, b] = value.toLowerCase()
  return `#${r}${r}${g}${g}${b}${b}`
}

const FooterBgField: TextFieldClientComponent = (props) => {
  const { path } = props
  const { value, setValue } = useField<string>({ path })

  const current = normalize(value)
  const sixDigits = toSixDigits(current)
  const isEmpty = current === ''
  const isInvalid = !isEmpty && sixDigits === null

  return (
    <div>
      {/* Ô text gốc của Payload — đường "nhập mã tuỳ ý", giữ nguyên hành vi cũ. */}
      <TextField {...props} />

      <div style={{ marginTop: '.5rem' }}>
        <div
          style={{
            fontSize: '.8125rem',
            color: 'var(--theme-elevation-600)',
            marginBottom: '.4rem',
          }}
        >
          Chọn nhanh từ bảng màu:
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem', alignItems: 'center' }}>
          {SWATCHES.map((swatch) => {
            const selected = sixDigits === swatch.value.toLowerCase()
            return (
              <button
                key={swatch.value}
                type="button"
                title={`${swatch.label} — ${swatch.value}`}
                aria-label={`${swatch.label} ${swatch.value}`}
                aria-pressed={selected}
                onClick={() => setValue(swatch.value)}
                style={{
                  width: 28,
                  height: 28,
                  padding: 0,
                  cursor: 'pointer',
                  borderRadius: 4,
                  background: swatch.value,
                  border: selected
                    ? '3px solid var(--theme-text)'
                    : '1px solid var(--theme-elevation-250)',
                }}
              />
            )
          })}

          {/* Ô chọn màu của hệ điều hành — cho mã ngoài bảng mà không phải gõ tay. */}
          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '.35rem',
              marginLeft: '.4rem',
              fontSize: '.8125rem',
            }}
          >
            <input
              type="color"
              value={sixDigits ?? '#ffffff'}
              onChange={(e) => setValue(e.target.value.toUpperCase())}
              style={{
                width: 32,
                height: 28,
                padding: 0,
                border: '1px solid var(--theme-elevation-250)',
                borderRadius: 4,
                background: 'transparent',
                cursor: 'pointer',
              }}
            />
            Màu khác
          </label>

          {current !== '' ? (
            <button
              type="button"
              onClick={() => setValue('')}
              style={{
                marginLeft: '.4rem',
                fontSize: '.8125rem',
                background: 'none',
                border: 'none',
                textDecoration: 'underline',
                cursor: 'pointer',
                color: 'var(--theme-elevation-600)',
              }}
            >
              Xoá, dùng theo "Nền chân trang"
            </button>
          ) : null}
        </div>

        <p
          style={{
            marginTop: '.5rem',
            marginBottom: 0,
            fontSize: '.8125rem',
            color: isInvalid ? 'var(--theme-error-500)' : 'var(--theme-elevation-600)',
          }}
        >
          {isEmpty
            ? 'Đang bỏ trống — chân trang theo lựa chọn "Nền chân trang" ở trên.'
            : isInvalid
              ? `"${current}" không phải mã màu hợp lệ. Website sẽ bỏ qua và dùng theo "Nền chân trang". Mã đúng có dạng #RRGGBB, ví dụ #F6D9DE.`
              : `Đang dùng ${current}.`}
        </p>
      </div>
    </div>
  )
}

export default FooterBgField
