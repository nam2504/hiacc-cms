/**
 * Giai đoạn 1 chỉ chạy tiếng Việt, nhưng schema + route dựng sẵn cho 4 ngôn ngữ.
 * Bật thêm ngôn ngữ = thêm vào ENABLED_LOCALES, không phải sửa code.
 */
export const ALL_LOCALES = [
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
] as const

export type LocaleCode = (typeof ALL_LOCALES)[number]['code']

export const DEFAULT_LOCALE: LocaleCode = 'vi'

/**
 * Ngôn ngữ đang bật. Tiếng Việt là mặc định (không có tiền tố đường dẫn), tiếng
 * Anh nằm dưới `/en`.
 *
 * 中文 và 한국어 CHƯA bật: hạ tầng sẵn sàng, nhưng bật mà không có bản dịch thì
 * người dùng chọn ngôn ngữ xong vẫn thấy tiếng Việt — tệ hơn là không cho chọn.
 * Khách cấp bản dịch thì thêm mã vào mảng này, không sửa chỗ nào khác.
 */
export const ENABLED_LOCALES: LocaleCode[] = ['vi', 'en']

export const enabledLocaleObjects = ALL_LOCALES.filter((l) =>
  ENABLED_LOCALES.includes(l.code),
)
