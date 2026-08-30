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

/** Giai đoạn 2: đổi thành ['vi','zh','en','ko'] khi khách cấp bản dịch. */
export const ENABLED_LOCALES: LocaleCode[] = ['vi']

export const enabledLocaleObjects = ALL_LOCALES.filter((l) =>
  ENABLED_LOCALES.includes(l.code),
)
