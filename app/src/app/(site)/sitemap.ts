import type { MetadataRoute } from 'next'
import { absoluteUrl, hreflangLanguages, localePath } from '@/lib/seo'
import { ENABLED_LOCALES } from '@/lib/locales'
import { isStaging } from '@/lib/staging'
import {
  getAllPageSlugs,
  getAllPostSlugs,
  getCategories,
} from '@/lib/site'
import { flatten, getServiceTree } from '@/lib/serviceTree'

/**
 * Sitemap đọc slug từ DB → PHẢI dynamic, cùng lý do như các trang khác:
 * prerender lúc build (DB trống) sẽ đóng băng sitemap chỉ còn 6 route cố định,
 * mất sạch slug dịch vụ / chuyên mục / bài viết / trang tĩnh. Trên staging
 * không lộ ra vì isStaging() trả mảng rỗng, nhưng production thì hỏng thật.
 */
export const dynamic = 'force-dynamic'

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

/**
 * Mọi trang có route tĩnh riêng phải nằm ở đây — không nhánh nào bên dưới sinh ra
 * chúng. Ba trang cuối từng bị bỏ sót: chúng có nội dung thật và khai canonical +
 * hreflang đầy đủ, nhưng không có trong sitemap nên Google không được mời vào.
 * Thêm route tĩnh mới thì thêm một dòng vào đây.
 */
const STATIC_PATHS = [
  { path: '/', priority: 1 },
  { path: '/gioi-thieu', priority: 0.8 },
  { path: '/lien-he', priority: 0.8 },
  { path: '/tin-tuc', priority: 0.7 },
  { path: '/chuyen-muc', priority: 0.6 },
  { path: '/van-ban-phap-luat', priority: 0.6 },
  { path: '/cong-cu/tinh-luong', priority: 0.6 },
  // Trang giữ chỗ (xem app/(site)/bang-gia/page.tsx). Vẫn khai vì mục này nằm
  // trên menu chính: để Google thấy một trang tử tế còn hơn để nó gặp 404.
  { path: '/bang-gia', priority: 0.5 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  /**
   * Bản staging: trả sitemap rỗng. robots.ts đã thôi khai file này, nhưng để nó
   * còn liệt kê URL thì bất kỳ ai (hay bot) đoán đúng đường dẫn vẫn cầm được
   * danh sách đầy đủ trang của bản nháp. Rỗng là dứt điểm.
   */
  if (isStaging()) return []

  const [tree, categories, posts, pages] = await Promise.all([
    getServiceTree(),
    getCategories(),
    getAllPostSlugs(),
    getAllPageSlugs(),
  ])

  const now = new Date()

  const entries: MetadataRoute.Sitemap = [
    ...STATIC_PATHS.map(({ path, priority }) => ({
      url: absoluteUrl(path),
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority,
    })),

    /**
     * Cây dịch vụ: 5 nhóm + các hạng mục con, đường dẫn lấy từ chính cây nên
     * khách thêm mục trong /admin là sitemap có ngay.
     *
     * Nhánh `/dich-vu/<slug>` cũ đã BỎ khỏi sitemap: nội dung của nó nay nằm ở
     * cây, khai cả hai là tự tạo trang trùng nội dung.
     */
    ...flatten(tree).map((node) => ({
      url: absoluteUrl(node.path),
      lastModified: now,
      changeFrequency: 'monthly' as const,
      // Nhóm cấp cao nhất quan trọng hơn hạng mục con.
      priority: node.path.split('/').length === 2 ? 0.9 : 0.8,
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

  /**
   * Nhân bản mọi URL cho từng ngôn ngữ đang bật, kèm bảng hreflang.
   *
   * Trước đây sitemap chỉ khai bản tiếng Việt, nên toàn bộ nhánh `/en` không
   * được Google biết tới — dịch xong mà không ai tìm thấy. Khai ở đây thay vì
   * sửa năm chỗ map bên trên: mọi entry đều đi qua `absoluteUrl` cùng một kiểu,
   * nên nhân bản một lượt ở cuối là đủ và không sót khi thêm loại trang mới.
   *
   * `alternates.languages` nói cho Google biết các URL này là bản dịch của nhau
   * chứ không phải nội dung trùng lặp.
   */
  return entries.flatMap((entry) => {
    const path = entry.url.replace(absoluteUrl('/'), '/').replace(/^\/+/, '/')
    const languages = hreflangLanguages(path)
    return ENABLED_LOCALES.map((code) => ({
      ...entry,
      url: absoluteUrl(localePath(path, code)),
      alternates: { languages },
    }))
  })
}
