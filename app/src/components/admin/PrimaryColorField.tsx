'use client'

import { TextField, useField } from '@payloadcms/ui'
import type { TextFieldClientComponent } from 'payload'

/**
 * Ô "Màu chủ đạo" trong Cấu hình chung.
 *
 * Trước đây là ô text trần: nhân viên phải tự gõ `#RRGGBB`, gõ sai một ký tự thì
 * `lib/brandStyle.ts` im lặng rơi về màu tenant và không ai biết đã gõ sai.
 *
 * Ở đây thêm HAI đường vào, cố ý giữ CẢ HAI chứ không thay nhau:
 *  1. Bảng màu bấm chọn — đường nhanh cho việc thường ngày.
 *  2. Ô nhập mã màu (ô text gốc của Payload, giữ nguyên) + ô chọn màu hệ điều
 *     hành — cho mã bất kỳ ngoài bảng.
 *
 * Cả hai đều ghi vào CÙNG một field `primaryColor` dưới dạng chuỗi `#RRGGBB`,
 * đúng định dạng `brandStyle.ts` đọc được. KHÔNG đặt defaultValue: bỏ trống vẫn
 * có nghĩa "dùng màu của tenant" như trước.
 *
 * Ô text gốc được dựng lại nguyên vẹn qua `<TextField>` nên validate, i18n,
 * trạng thái lỗi và nút reset của Payload vẫn chạy y như cũ.
 */

/** Cùng luật với `HEX` trong `lib/brandStyle.ts` — dùng để BÁO cho người nhập, không phải để chặn. */
const HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

/**
 * Dải màu an toàn cho website kế toán (đủ tương phản với chữ trắng trên nút).
 *
 * Màu logo của tenant KHÔNG nằm trong danh sách này — nó được chèn vào đầu lúc
 * chạy từ prop `tenantBrand` (xem `globals/Settings.ts`). Viết cứng ở đây thì
 * site HiTax cũng hiện ô "Đỏ HiACC", tức là rò thương hiệu khách này sang khách kia.
 */
const SWATCHES: { value: string; label: string }[] = [
  { value: '#0F52BA', label: 'Xanh dương' },
  { value: '#0E7C66', label: 'Xanh lá đậm' },
  { value: '#1F3A5F', label: 'Xanh navy' },
  { value: '#B45309', label: 'Cam đất' },
  { value: '#6D28D9', label: 'Tím' },
  { value: '#B91C1C', label: 'Đỏ trầm' },
  { value: '#334155', label: 'Xám đá' },
]

const normalize = (raw: unknown) => (typeof raw === 'string' ? raw.trim() : '')

/** `#abc` → `#aabbcc`, để ô chọn màu (chỉ hiểu 6 ký tự) hiện đúng màu đang lưu. */
const toSixDigits = (value: string) => {
  if (!HEX.test(value)) return null
  if (value.length === 7) return value.toLowerCase()
  const [, r, g, b] = value.toLowerCase()
  return `#${r}${r}${g}${g}${b}${b}`
}

type TenantProps = { tenantBrand?: string; tenantName?: string }

const PrimaryColorField: TextFieldClientComponent = (props) => {
  const { path } = props
  const { tenantBrand, tenantName } = props as typeof props & TenantProps
  const { value, setValue } = useField<string>({ path })

  // Màu logo của tenant đứng đầu bảng. Thiếu prop (field dùng ở chỗ khác) thì
  // bảng vẫn chạy với dải màu chung, chỉ mất ô đầu.
  const swatches = tenantBrand
    ? [{ value: tenantBrand, label: `Màu logo${tenantName ? ` ${tenantName}` : ''}` }, ...SWATCHES]
    : SWATCHES

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
          {swatches.map((swatch) => {
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
                  // Viền dày hơn thay cho dấu tích: dấu tích trên nền đậm/nhạt
                  // đều có trường hợp chìm mất.
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
              value={sixDigits ?? toSixDigits(normalize(tenantBrand)) ?? '#000000'}
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
              Xoá, dùng màu mặc định
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
            ? 'Đang bỏ trống — website dùng màu mặc định của site.'
            : isInvalid
              ? `"${current}" không phải mã màu hợp lệ. Website sẽ bỏ qua và dùng màu mặc định. Mã đúng có dạng #RRGGBB, ví dụ #1F3A5F.`
              : `Đang dùng ${current}.`}
        </p>
      </div>
    </div>
  )
}

export default PrimaryColorField
