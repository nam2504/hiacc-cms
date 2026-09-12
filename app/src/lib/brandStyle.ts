import { TENANT } from '@/config/tenant'

/**
 * Sinh CSS đè biến màu thương hiệu lúc chạy.
 *
 * Vì sao cần: `src/styles/tokens.css` là file tĩnh, giá trị nướng vào lúc build.
 * Trước đây field "Màu chủ đạo" trong /admin không có code nào đọc — mô tả field
 * hứa "đổi màu này đổi toàn bộ nút và tiêu đề" nhưng sửa xong không có gì đổi.
 * Hàm này nối lại: Settings (khách sửa) → tenant (mặc định theo site) → tokens.css.
 *
 * Chỉ đè các biến DẪN XUẤT từ màu chính. Màu nền, chữ, viền vẫn nằm ở tokens.css
 * vì đổi chúng theo màu brand sẽ phá tương phản đã đo (WCAG, xem V3).
 */

/** Chỉ nhận #RGB hoặc #RRGGBB — chuỗi lạ từ DB không được phép chèn vào <style>. */
const HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

function normalize(hex: string): string | null {
  const value = hex.trim()
  if (!HEX.test(value)) return null
  if (value.length === 4) {
    // #abc → #aabbcc, để phép tính sáng/tối bên dưới luôn làm việc với 6 ký tự.
    const [, r, g, b] = value
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase()
  }
  return value.toLowerCase()
}

/** Trộn màu với đen (ratio<0) hoặc trắng (ratio>0). ratio trong [-1, 1]. */
function shade(hex: string, ratio: number): string {
  const num = parseInt(hex.slice(1), 16)
  const channels = [(num >> 16) & 255, (num >> 8) & 255, num & 255]
  const mixed = channels.map((c) => {
    const target = ratio > 0 ? 255 : 0
    const amount = Math.abs(ratio)
    return Math.round(c + (target - c) * amount)
  })
  return `#${mixed.map((c) => c.toString(16).padStart(2, '0')).join('')}`
}

/**
 * Độ sáng cảm nhận (WCAG relative luminance, bản rút gọn đủ dùng để chọn
 * chữ đen hay trắng). Ngưỡng 0.55 chọn theo thử nghiệm: #1f4141 và #b22820
 * đều ra chữ trắng, #f8f4f4 ra chữ đen.
 */
function isLight(hex: string): boolean {
  const num = parseInt(hex.slice(1), 16)
  const [r, g, b] = [(num >> 16) & 255, (num >> 8) & 255, num & 255].map((c) => {
    const s = c / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.55 * 0.5
}

/**
 * CSS đè màu nền chân trang khi khách điền `Settings.footerBg`.
 *
 * Vì sao không để khách tự lo màu chữ: gõ nền đậm mà chữ vẫn đen là không đọc
 * được, mà admin không có chỗ nhập màu chữ. Ở đây tự chọn đen/trắng theo độ
 * sáng của nền, nên mọi mã màu hợp lệ đều ra footer đọc được.
 *
 * Trả chuỗi rỗng khi bỏ trống hoặc mã sai định dạng → footer giữ nguyên tông
 * `footerTheme` (class `.footerDark` trong Footer.module.css lo phần đó).
 *
 * Biến ở đây khớp tên với `.footer` trong Footer.module.css. Đặt trên `:root`
 * để đè được giá trị khai trong class đã hash của CSS Module.
 */
export function footerStyle(footerBg?: string | null): string {
  const bg = footerBg ? normalize(footerBg) : null
  if (!bg) return ''

  const light = isLight(bg)
  const text = light ? '#201e1d' : 'rgb(255 255 255 / 0.82)'
  const muted = light ? '#605d5d' : 'rgb(255 255 255 / 0.6)'
  const border = light ? '#a6a5a5' : 'rgb(255 255 255 / 0.15)'

  return `:root{--footer-bg:${bg};--footer-text:${text};--footer-text-muted:${muted};--footer-border:${border}}`
}

/**
 * Trả về nội dung thẻ <style> đè màu, hoặc chuỗi rỗng khi không cần đè
 * (màu trùng mặc định của tenant → để tokens.css tự lo, tránh thẻ style thừa).
 *
 * @param primaryColor giá trị Settings.primaryColor, có thể null/rỗng/sai định dạng
 */
export function brandStyle(primaryColor?: string | null): string {
  const custom = primaryColor ? normalize(primaryColor) : null
  const brand = custom ?? normalize(TENANT.colors.brand)
  if (!brand) return ''

  // Không có màu tuỳ chỉnh hợp lệ → dùng nguyên bộ màu đã cân của tenant.
  if (!custom || custom === normalize(TENANT.colors.brand)) {
    const { brand: b, brandDark, brandLight, brandTint, accent, ink } = TENANT.colors
    return `:root{--color-brand:${b};--color-brand-dark:${brandDark};--color-brand-light:${brandLight};--color-brand-tint:${brandTint};--color-accent:${accent};--color-ink:${ink}}`
  }

  // Khách đổi màu trong admin: suy ra dải sáng/tối từ màu đó, giữ nguyên accent/ink
  // (hai màu này không phải dẫn xuất của brand, đổi theo sẽ lệch thiết kế).
  return [
    ':root{',
    `--color-brand:${brand};`,
    `--color-brand-dark:${shade(brand, -0.18)};`,
    `--color-brand-light:${shade(brand, 0.28)};`,
    `--color-brand-tint:${shade(brand, 0.92)};`,
    '}',
  ].join('')
}
