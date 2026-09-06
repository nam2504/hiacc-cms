/**
 * Truy cập dữ liệu toàn site (global `settings`, chi nhánh, bài mới).
 * Mọi gói W1–W8 lấy thông tin liên hệ / logo / MXH QUA ĐÂY, không tự gọi
 * payload.findGlobal và tuyệt đối không hardcode — khách chốt 30/08 là mọi
 * thông tin liên hệ phải sửa được trong admin (AUDIT §5.5).
 */
import { getPayload, type Where } from 'payload'
import configPromise from '@payload-config'
import { DEFAULT_LOCALE, type LocaleCode } from './locales'
import type { Branch, Category, Config, Page, Post, Service, Setting } from '@/payload-types'

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
 * Settings có thể chưa được tạo lần đầu (DB trống) → trả null thay vì ném lỗi,
 * để trang vẫn render được lúc mới cài. Component phải chịu được null.
 */
export async function getSettings(
  locale: LocaleCode = DEFAULT_LOCALE,
): Promise<Setting | null> {
  try {
    const payload = await getPayloadClient()
    return (await payload.findGlobal({ slug: 'settings', locale: asPayloadLocale(locale), depth: 1 })) as Setting
  } catch (error) {
    // DB chết thì trang vẫn render rỗng (chủ ý); không log thì không ai biết.
    console.error('[site] getSettings không đọc được dữ liệu:', error)
    return null
  }
}

export async function getBranches(locale: LocaleCode = DEFAULT_LOCALE): Promise<Branch[]> {
  try {
    const payload = await getPayloadClient()
    const res = await payload.find({
      collection: 'branches',
      locale: asPayloadLocale(locale),
      limit: 50,
      sort: 'order',
    })
    return res.docs as Branch[]
  } catch (error) {
    // DB chết thì trang vẫn render rỗng (chủ ý); không log thì không ai biết.
    console.error('[site] getBranches không đọc được dữ liệu:', error)
    return []
  }
}

/** Dùng cho khối "bài viết gần đây" ở footer (AUDIT §3.9). */
export async function getRecentPosts(
  limit = 3,
  locale: LocaleCode = DEFAULT_LOCALE,
): Promise<Post[]> {
  try {
    const payload = await getPayloadClient()
    const res = await payload.find({
      collection: 'posts',
      locale: asPayloadLocale(locale),
      limit,
      sort: '-publishedAt',
      where: { _status: { equals: 'published' } },
    })
    return res.docs as Post[]
  } catch (error) {
    // DB chết thì trang vẫn render rỗng (chủ ý); không log thì không ai biết.
    console.error('[site] getRecentPosts không đọc được dữ liệu:', error)
    return []
  }
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

/** Dịch vụ đã sắp thứ tự — dùng cho khối "Dịch vụ" trang chủ và trang /dich-vu. */
export async function getServices(locale: LocaleCode = DEFAULT_LOCALE): Promise<Service[]> {
  try {
    const payload = await getPayloadClient()
    const res = await payload.find({
      collection: 'services',
      locale: asPayloadLocale(locale),
      limit: 50,
      sort: 'order',
      // depth 1: cần `image` trả về object Media (có url) chứ không phải ID số,
      // nếu không thẻ dịch vụ ngoài trang chủ / /dich-vu không render được ảnh.
      depth: 1,
    })
    return res.docs as Service[]
  } catch (error) {
    // DB chết thì trang vẫn render rỗng (chủ ý); không log thì không ai biết.
    console.error('[site] getServices không đọc được dữ liệu:', error)
    return []
  }
}

/** Chuyên mục đã sắp thứ tự — dùng cho khối "Trung tâm kiến thức" và trang /chuyen-muc. */
export async function getCategories(locale: LocaleCode = DEFAULT_LOCALE): Promise<Category[]> {
  try {
    const payload = await getPayloadClient()
    const res = await payload.find({
      collection: 'categories',
      locale: asPayloadLocale(locale),
      limit: 100,
      sort: 'order',
    })
    return res.docs as Category[]
  } catch (error) {
    // DB chết thì trang vẫn render rỗng (chủ ý); không log thì không ai biết.
    console.error('[site] getCategories không đọc được dữ liệu:', error)
    return []
  }
}

/**
 * Lấy 1 bản ghi theo slug. Không tìm thấy → null, để trang gọi notFound().
 * Dùng chung cho pages / services / posts / categories, đừng viết lại từng gói.
 */
async function findOneBySlug<T>(
  collection: 'pages' | 'services' | 'posts' | 'categories',
  slug: string,
  locale: LocaleCode,
): Promise<T | null> {
  try {
    const payload = await getPayloadClient()
    const res = await payload.find({
      collection,
      locale: asPayloadLocale(locale),
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 2,
    })
    return (res.docs[0] as T) ?? null
  } catch (error) {
    // DB chết thì trang vẫn render rỗng (chủ ý); không log thì không ai biết.
    console.error('[site] findOneBySlug không đọc được dữ liệu:', error)
    return null
  }
}

export const getPageBySlug = (slug: string, locale: LocaleCode = DEFAULT_LOCALE) =>
  findOneBySlug<Page>('pages', slug, locale)

export const getServiceBySlug = (slug: string, locale: LocaleCode = DEFAULT_LOCALE) =>
  findOneBySlug<Service>('services', slug, locale)

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
  try {
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
  } catch (error) {
    // DB chết thì trang vẫn render rỗng (chủ ý); không log thì không ai biết.
    console.error('[site] getPosts không đọc được dữ liệu:', error)
    return { docs: [] as Post[], totalPages: 0, page: 1, totalDocs: 0 }
  }
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
  try {
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
  } catch (error) {
    // DB chết thì trang vẫn render rỗng (chủ ý); không log thì không ai biết.
    console.error('[site] getAllPostSlugs không đọc được dữ liệu:', error)
    return []
  }
}

/**
 * Slug + updatedAt của trang tĩnh đã xuất bản (route `/<slug>` theo INTERFACE §6.2).
 * `pages` cũng bật drafts nên phải lọc _status như posts.
 */
export async function getAllPageSlugs(
  locale: LocaleCode = DEFAULT_LOCALE,
): Promise<SlugEntry[]> {
  try {
    const payload = await getPayloadClient()
    const res = await payload.find({
      collection: 'pages',
      locale: asPayloadLocale(locale),
      where: { _status: { equals: 'published' } },
      limit: 500,
      depth: 0,
    })
    return (res.docs as Page[]).map((doc) => ({ slug: doc.slug, updatedAt: doc.updatedAt }))
  } catch (error) {
    // DB chết thì trang vẫn render rỗng (chủ ý); không log thì không ai biết.
    console.error('[site] getAllPageSlugs không đọc được dữ liệu:', error)
    return []
  }
}
