import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/seo'
import {
  getAllPageSlugs,
  getAllPostSlugs,
  getCategories,
  getServices,
} from '@/lib/site'

/**
 * /sitemap.xml — AUDIT §5.2. Liệt kê 6 route cố định + mọi slug động
 * (dịch vụ, chuyên mục, bài viết, trang tĩnh) theo bảng route INTERFACE §6.2.
 *
 * Chịu được DB lỗi: mọi helper trong site.ts tự nuốt lỗi và trả mảng rỗng, nên
 * khi mất DB sitemap vẫn ra 6 route tĩnh thay vì trả 500 — Google gặp 500 nhiều
 * lần sẽ hạ tần suất bò cả site.
 *
 * KHÔNG liệt kê `/admin` và `/api` (robots.ts đã chặn), cũng không liệt kê
 * `?page=` của danh sách: trang 2 trở đi là biến thể phân trang, để Google tự đi
 * theo link thay vì khai như trang độc lập.
 */

/** Trang tĩnh đã có route riêng — bỏ khỏi nhánh `/<slug>` để không khai trùng URL. */
const PAGES_WITH_OWN_ROUTE = new Set(['gioi-thieu', 'lien-he'])

const STATIC_PATHS = [
  { path: '/', priority: 1 },
  { path: '/gioi-thieu', priority: 0.8 },
  { path: '/dich-vu', priority: 0.9 },
  { path: '/lien-he', priority: 0.8 },
  { path: '/tin-tuc', priority: 0.7 },
  { path: '/chuyen-muc', priority: 0.6 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, categories, posts, pages] = await Promise.all([
    getServices(),
    getCategories(),
    getAllPostSlugs(),
    getAllPageSlugs(),
  ])

  const now = new Date()

  return [
    ...STATIC_PATHS.map(({ path, priority }) => ({
      url: absoluteUrl(path),
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority,
    })),

    ...services.map((service) => ({
      url: absoluteUrl(`/dich-vu/${service.slug}`),
      lastModified: new Date(service.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),

    ...categories.map((category) => ({
      url: absoluteUrl(`/chuyen-muc/${category.slug}`),
      lastModified: new Date(category.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),

    ...posts.map((post) => ({
      url: absoluteUrl(`/tin-tuc/${post.slug}`),
      lastModified: new Date(post.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),

    ...pages
      .filter((page) => !PAGES_WITH_OWN_ROUTE.has(page.slug))
      .map((page) => ({
        url: absoluteUrl(`/${page.slug}`),
        lastModified: new Date(page.updatedAt),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      })),
  ]
}
