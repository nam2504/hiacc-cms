import { headers } from 'next/headers'
import { DEFAULT_LOCALE, ENABLED_LOCALES, type LocaleCode } from '@/lib/locales'

/**
 * Ngôn ngữ của request hiện tại, do middleware đặt qua header `x-locale`.
 *
 * Trang nào cần dữ liệu theo ngôn ngữ thì gọi hàm này thay vì dùng
 * DEFAULT_LOCALE trần — truyền trần là bản tiếng Anh lặng lẽ hiện nội dung
 * tiếng Việt mà không ai báo lỗi.
 */
export async function getRequestLocale(): Promise<LocaleCode> {
  const store = await headers()
  const value = store.get('x-locale')
  if (value && ENABLED_LOCALES.includes(value as LocaleCode)) return value as LocaleCode
  return DEFAULT_LOCALE
}
