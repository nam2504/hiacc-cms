/**
 * "Doc này đã có bản tiếng Anh thật chưa?" — hàm thuần, dùng chung cho trang và sitemap.
 *
 * Payload `fallback: true` làm trang /en của doc chưa dịch hiện nguyên nội dung
 * tiếng Việt. Để Google không index bản trùng đó, ta phải phân biệt được "đã dịch"
 * với "đang mượn chữ Việt": đọc bản en với `fallbackLocale: false` rồi so với bản vi.
 */

/** Trường chính cần có bản en, theo collection. */
export const PRIMARY_FIELDS = {
  'service-nodes': ['title', 'summary', 'body'],
  posts: ['title', 'excerpt', 'content'],
  pages: ['title', 'content'],
  categories: ['name', 'description'],
} as const

export type AvailabilityCollection = keyof typeof PRIMARY_FIELDS

/** Văn bản từ 4 từ trở lên giống hệt bản vi thì coi là chép, ngắn hơn (tên riêng, "Hotline") thì được trùng. */
const MIN_WORDS_TO_REQUIRE_DIFFERENCE = 4

const SKIP_KEYS = new Set(['id', 'blockType', 'blockName', 'href', 'url', 'icon', 'relationTo'])

function collectText(value: unknown, out: string[]): void {
  if (value == null) return
  if (typeof value === 'string') {
    out.push(value)
    return
  }
  if (Array.isArray(value)) {
    for (const item of value) collectText(item, out)
    return
  }
  if (typeof value !== 'object') return
  const obj = value as Record<string, unknown>
  // Lexical: chỉ lấy chữ ở nút `text`, các chuỗi còn lại (type, format, mode...) là cấu trúc.
  if ('root' in obj && obj.root && typeof obj.root === 'object') {
    collectLexical(obj.root, out)
    return
  }
  for (const [key, child] of Object.entries(obj)) {
    if (!SKIP_KEYS.has(key)) collectText(child, out)
  }
}

function collectLexical(node: unknown, out: string[]): void {
  if (!node || typeof node !== 'object') return
  const obj = node as { text?: unknown; children?: unknown }
  if (typeof obj.text === 'string') out.push(obj.text)
  if (Array.isArray(obj.children)) for (const child of obj.children) collectLexical(child, out)
}

/** Rút toàn bộ chữ của một field (chuỗi, rich text, khối lồng nhau), chuẩn hoá khoảng trắng. */
export function extractText(value: unknown): string {
  const parts: string[] = []
  collectText(value, parts)
  return parts.join(' ').replace(/\s+/g, ' ').trim()
}

const wordCount = (text: string) => (text ? text.split(' ').length : 0)

/**
 * Bản en "có thật" khi với mỗi field chính có chữ ở vi: en khác rỗng, và nếu chữ vi
 * từ 4 từ trở lên thì en phải khác chữ vi. Field vi rỗng thì bỏ qua.
 */
export function hasEnglishVersion(
  vi: Record<string, unknown> | null | undefined,
  en: Record<string, unknown> | null | undefined,
  fields: readonly string[],
): boolean {
  if (!vi) return true
  for (const field of fields) {
    const viText = extractText(vi[field])
    if (!viText) continue
    const enText = extractText(en?.[field])
    if (!enText) return false
    if (wordCount(viText) >= MIN_WORDS_TO_REQUIRE_DIFFERENCE && enText === viText) return false
  }
  return true
}

/**
 * Trang nhóm dịch vụ hiển thị luôn nội dung hạng mục đầu tiên, nên "có bản en"
 * của trang nhóm đòi cả hai doc: chính nó và con đầu tiên.
 */
export function serviceNodeKeys(node: {
  id: string
  children: readonly { id: string }[]
}): string[] {
  return node.children.length > 0 ? [node.id, node.children[0].id] : [node.id]
}

/** Có bản en khi mọi key đều nằm trong tập đã dịch. */
export function allTranslated(keys: readonly string[], translated: ReadonlySet<string>): boolean {
  return keys.every((key) => translated.has(key))
}

/** Ngôn ngữ được khai trong hreflang/sitemap: bỏ `en` khi doc chưa có bản en. */
export function declaredLocales<T extends string>(enabled: readonly T[], hasEnglish: boolean): T[] {
  return enabled.filter((code) => hasEnglish || code !== ('en' as string))
}

/** Metadata robots cho trang /en chưa dịch (noindex); staging giữ nofollow như layout. Các trường hợp khác: không override. */
export function untranslatedRobotsMeta(locale: string, hasEnglish: boolean, staging: boolean) {
  return locale === 'en' && !hasEnglish ? { robots: { index: false, follow: !staging } } : {}
}
