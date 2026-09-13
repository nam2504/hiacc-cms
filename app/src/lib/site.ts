/**
 * Truy cập dữ liệu toàn site (global `settings`, chi nhánh, bài mới).
 * Mọi gói W1–W8 lấy thông tin liên hệ / logo / MXH QUA ĐÂY, không tự gọi
 * payload.findGlobal và tuyệt đối không hardcode — khách chốt 30/08 là mọi
 * thông tin liên hệ phải sửa được trong admin (AUDIT §5.5).
 */
import { cache } from 'react'
import { getPayload, type Where } from 'payload'
import configPromise from '@payload-config'
import { DEFAULT_LOCALE, type LocaleCode } from './locales'
import { createTranslator } from './i18n'
import { TENANT } from '@/config/tenant'
import { logger } from './observability/logger'
import type { Branch, Category, Config, Page, Post, Setting } from '@/payload-types'

/**
 * payload-types.ts sinh union locale HẸP theo ENABLED_LOCALES đang bật (giờ chỉ 'vi'),
 * còn LocaleCode là union RỘNG của cả 4 ngôn ngữ tương lai. Ép kiểu đúng một chỗ ở đây
 * để component vẫn nhận LocaleCode — bật ngôn ngữ mới chỉ sửa locales.ts, không sửa
 * component (cam kết i18n với khách 30/08). Khi đã bật đủ 4, ép kiểu này thành no-op.
 */
type PayloadLocale = Config['locale']
const asPayloadLocale = (locale: LocaleCode) => locale as PayloadLocale

export async function getPayloadClient() {
  return getPayload({ config: configPromise })
}

/**
 * DB chết thì trang vẫn render rỗng bằng `fallback` (chủ ý) thay vì ném lỗi ra
 * ngoài — không log thì không ai biết. Gộp lại từ 10 khối try/catch giống hệt
 * nhau trong file này.
 */
async function safeQuery<T>(label: string, fallback: T, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    logger.error(`[site] ${label} không đọc được dữ liệu:`, error)
    return fallback
  }
}

/**
 * Bọc `cache()` như getServiceTree: layout (Header + Footer) và page đều gọi
 * getSettings trong CÙNG một request. Không dedupe thì mỗi lượt tải trang là
 * 2–3 lần đọc global settings — đo được TTFB 1.0–3.0s trên staging (09/09).
 * Cache chỉ sống trong phạm vi một request nên khách sửa admin vẫn thấy ngay.
 *
 * Settings có thể chưa được tạo lần đầu (DB trống) → trả null thay vì ném lỗi,
 * để trang vẫn render được lúc mới cài. Component phải chịu được null.
 */
export const getSettings = cache(
  async (locale: LocaleCode = DEFAULT_LOCALE): Promise<Setting | null> =>
    safeQuery('getSettings', null, async () => {
      const payload = await getPayloadClient()
      return (await payload.findGlobal({
        slug: 'settings',
        locale: asPayloadLocale(locale),
        depth: 1,
      })) as Setting
    }),
)

/**
 * Tên site để hiển thị, ĐÚNG theo ngôn ngữ đang xem (09/09, khách báo trang EN
 * hiện tiêu đề tiếng Việt).
 *
 * Vì sao cần hàm riêng thay vì `brandName()` trong config/tenant.ts:
 * field `siteName` trong CMS KHÔNG localized (collections/Settings.ts:39) — một
 * giá trị chung cho mọi ngôn ngữ. Khách bỏ trống thì phải dựng tên theo locale từ
 * chuỗi i18n `seo.siteName` ('Kế toán {brand}' / '{brand} Accounting'), còn
 * brandName() trả thẳng TENANT.name nên trang EN luôn ra tên tiếng Việt.
 *
 * Hai lỗi cũ mà hàm này gom lại một chỗ:
 *  - `brandName(settings?.siteName) || t('seo.siteName')` — brandName() không bao
 *    giờ rỗng nên vế sau là code chết.
 *  - `settings?.siteName || t('seo.siteName')` — quên truyền {brand}, CMS trống
 *    thì in ra nguyên chữ "{brand}".
 *
 * Đặt ở đây (không ở config/tenant.ts) để tránh vòng phụ thuộc config ↔ i18n.
 */
export function siteDisplayName(
  settings: Pick<Setting, 'siteName'> | null | undefined,
  locale: LocaleCode = DEFAULT_LOCALE,
): string {
  const fromCms = settings?.siteName?.trim()
  if (fromCms) return fromCms
  return createTranslator(locale)('seo.siteName', { brand: TENANT.name })
}

export async function getBranches(locale: LocaleCode = DEFAULT_LOCALE): Promise<Branch[]> {
  return safeQuery('getBranches', [] as Branch[], async () => {
    const payload = await getPayloadClient()
    const res = await payload.find({
      collection: 'branches',
      locale: asPayloadLocale(locale),
      limit: 50,
      sort: 'order',
    })
    return res.docs as Branch[]
  })
}

/** Dùng cho khối "bài viết gần đây" ở footer (AUDIT §3.9). */
export async function getRecentPosts(
  limit = 3,
  locale: LocaleCode = DEFAULT_LOCALE,
): Promise<Post[]> {
  return safeQuery('getRecentPosts', [] as Post[], async () => {
    const payload = await getPayloadClient()
    const res = await payload.find({
      collection: 'posts',
      locale: asPayloadLocale(locale),
      limit,
      sort: '-publishedAt',
      where: { _status: { equals: 'published' } },
    })
    return res.docs as Post[]
  })
}

/** Đường dẫn ảnh từ field upload — chịu được cả dạng id lẫn object đã populate. */
export function mediaUrl(value: unknown): string | null {
  if (!value || typeof value !== 'object') return null
  const url = (value as { url?: string | null }).url
  return url ?? null
}

export function mediaAlt(value: unknown, fallback = ''): string {
  if (!value || typeof value !== 'object') return fallback
  return (value as { alt?: string | null }).alt ?? fallback
}

/**
 * Dịch LocaleCode (union rộng 4 ngôn ngữ) sang kiểu Payload chấp nhận (union hẹp
 * theo ENABLED_LOCALES). Gói nào cần payload.find() cho collection chưa có helper
 * riêng thì PHẢI bọc locale qua đây, đừng truyền DEFAULT_LOCALE trần — trần sẽ
 * fail type check ngay khi bật thêm ngôn ngữ.
 */
export const toPayloadLocale = asPayloadLocale

/** Chuyên mục đã sắp thứ tự — dùng cho khối "Trung tâm kiến thức" và trang /chuyen-muc. */
export async function getCategories(locale: LocaleCode = DEFAULT_LOCALE): Promise<Category[]> {
  return safeQuery('getCategories', [] as Category[], async () => {
    const payload = await getPayloadClient()
    const res = await payload.find({
      collection: 'categories',
      locale: asPayloadLocale(locale),
      limit: 100,
      sort: 'order',
    })
    return res.docs as Category[]
  })
}

/**
 * Số bài ĐÃ XUẤT BẢN của từng chuyên mục, khoá theo slug.
 *
 * Dùng để đánh dấu chuyên mục rỗng ngay ở danh sách (09/09): 7/12 chuyên mục
 * chưa có bài nào, nếu không báo trước thì khách bấm vào 7 thẻ rồi mới biết
 * là trống — trông như site hỏng chứ không như nội dung chưa viết.
 *
 * Đếm bằng MỘT truy vấn depth=0 lấy riêng cột category rồi gom ở tầng app,
 * KHÔNG phải 12 truy vấn count song song: số bài (9, cỡ vài trăm khi khách
 * viết thật) nhỏ hơn nhiều so với số chuyên mục × chi phí round-trip.
 *
 * cache() để trang chủ và /chuyen-muc trong cùng một request dùng chung kết quả.
 */
export const getPostCountsByCategory = cache(
  async (locale: LocaleCode = DEFAULT_LOCALE): Promise<Record<string, number>> =>
    safeQuery('getPostCountsByCategory', {}, async () => {
      const payload = await getPayloadClient()
      const res = await payload.find({
        collection: 'posts',
        locale: asPayloadLocale(locale),
        where: { _status: { equals: 'published' } },
        limit: 1000,
        depth: 1,
        select: { category: true },
      })
      const counts: Record<string, number> = {}
      for (const doc of res.docs as Post[]) {
        // depth:1 → category là object; nhưng bài chưa gán chuyên mục thì null,
        // và nếu Payload trả về id thô thì không có slug để gom → bỏ qua cả hai.
        const category = doc.category
        const slug =
          category && typeof category === 'object' ? (category as Category).slug : null
        if (!slug) continue
        counts[slug] = (counts[slug] ?? 0) + 1
      }
      return counts
    }),
)

/**
 * Lấy 1 bản ghi theo slug. Không tìm thấy → null, để trang gọi notFound().
 * Dùng chung cho pages / services / posts / categories, đừng viết lại từng gói.
 */
async function findOneBySlug<T>(
  collection: 'pages' | 'posts' | 'categories',
  slug: string,
  locale: LocaleCode,
): Promise<T | null> {
  return safeQuery('findOneBySlug', null, async () => {
    const payload = await getPayloadClient()
    const res = await payload.find({
      collection,
      locale: asPayloadLocale(locale),
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 2,
    })
    return (res.docs[0] as T) ?? null
  })
}

export const getPageBySlug = (slug: string, locale: LocaleCode = DEFAULT_LOCALE) =>
  findOneBySlug<Page>('pages', slug, locale)

export const getPostBySlug = (slug: string, locale: LocaleCode = DEFAULT_LOCALE) =>
  findOneBySlug<Post>('posts', slug, locale)

export const getCategoryBySlug = (slug: string, locale: LocaleCode = DEFAULT_LOCALE) =>
  findOneBySlug<Category>('categories', slug, locale)

/**
 * Bài viết đã xuất bản, phân trang. `categorySlug` lọc theo chuyên mục.
 * posts có drafts → PHẢI lọc _status='published', nếu không bản nháp lọt ra site public.
 */
export async function getPosts({
  page = 1,
  limit = 9,
  categorySlug,
  locale = DEFAULT_LOCALE,
}: {
  page?: number
  limit?: number
  categorySlug?: string
  locale?: LocaleCode
} = {}) {
  return safeQuery(
    'getPosts',
    { docs: [] as Post[], totalPages: 0, page: 1, totalDocs: 0 },
    async () => {
      const payload = await getPayloadClient()
      const where: Where = { _status: { equals: 'published' } }
      if (categorySlug) where['category.slug'] = { equals: categorySlug }

      const res = await payload.find({
        collection: 'posts',
        locale: asPayloadLocale(locale),
        where,
        page,
        limit,
        depth: 2,
        sort: '-publishedAt',
      })
      return {
        docs: res.docs as Post[],
        totalPages: res.totalPages,
        page: res.page ?? 1,
        totalDocs: res.totalDocs,
      }
    },
  )
}

/** Một mục trong sitemap: đường dẫn slug + mốc sửa cuối, đủ cho MetadataRoute.Sitemap. */
export type SlugEntry = { slug: string; updatedAt: string }

/**
 * Slug + updatedAt của mọi bài viết ĐÃ XUẤT BẢN, cho sitemap.
 * Không dùng getPosts() vì sitemap cần cả nghìn bản ghi trong một lượt, còn getPosts()
 * phân trang 9 bài/trang; nhưng vẫn giữ đúng bộ lọc _status='published' của nó —
 * lọt bản nháp ra sitemap là Google index nội dung chưa duyệt.
 */
export async function getAllPostSlugs(
  locale: LocaleCode = DEFAULT_LOCALE,
): Promise<SlugEntry[]> {
  return safeQuery('getAllPostSlugs', [] as SlugEntry[], async () => {
    const payload = await getPayloadClient()
    const res = await payload.find({
      collection: 'posts',
      locale: asPayloadLocale(locale),
      where: { _status: { equals: 'published' } },
      limit: 1000,
      depth: 0,
      sort: '-publishedAt',
    })
    return (res.docs as Post[]).map((doc) => ({ slug: doc.slug, updatedAt: doc.updatedAt }))
  })
}

/**
 * Slug + updatedAt của trang tĩnh đã xuất bản (route `/<slug>` theo INTERFACE §6.2).
 * `pages` cũng bật drafts nên phải lọc _status như posts.
 */
export async function getAllPageSlugs(
  locale: LocaleCode = DEFAULT_LOCALE,
): Promise<SlugEntry[]> {
  return safeQuery('getAllPageSlugs', [] as SlugEntry[], async () => {
    const payload = await getPayloadClient()
    const res = await payload.find({
      collection: 'pages',
      locale: asPayloadLocale(locale),
      where: { _status: { equals: 'published' } },
      limit: 500,
      depth: 0,
    })
    return (res.docs as Page[]).map((doc) => ({ slug: doc.slug, updatedAt: doc.updatedAt }))
  })
}
