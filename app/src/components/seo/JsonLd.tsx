import { createTranslator } from '@/lib/i18n'
import { DEFAULT_LOCALE, type LocaleCode } from '@/lib/locales'
import { absoluteUrl } from '@/lib/seo'

/**
 * Dữ liệu có cấu trúc (schema.org) nhúng vào trang — site tham chiếu không có
 * thứ này (AUDIT §5.3), nên Google không hiện được sao đánh giá, địa chỉ, giờ mở
 * cửa trong kết quả tìm kiếm.
 *
 * Server component: chỉ sinh chuỗi JSON lúc render, không cần JavaScript phía client.
 *
 * Luật chung của cả file: field nào CMS chưa nhập thì BỎ HẲN khỏi output, tuyệt
 * đối không điền giá trị mẫu. Structured data bịa là lý do Google phạt thủ công.
 */
export type JsonLdNode = Record<string, unknown>

/**
 * Giá trị "có mặt nhưng vô nghĩa": seed buộc phải điền chuỗi giữ chỗ vào các field
 * BẮT BUỘC của schema (`branches.address`) khi khách chưa cấp dữ liệu thật. Với
 * người đọc thì chuỗi đó vô hại, nhưng đẩy vào schema.org là khai địa chỉ giả với
 * Google — đúng thứ contract cấm. Coi như rỗng.
 */
function isPlaceholder(value: string, locale: LocaleCode = DEFAULT_LOCALE): boolean {
  const t = createTranslator(locale)
  return value.trim().toLowerCase() === t('seo.placeholder.pending').toLowerCase()
}

/** Bỏ mọi khoá có giá trị rỗng (null / undefined / chuỗi trắng / giữ chỗ / mảng rỗng). */
function compact(node: JsonLdNode, locale: LocaleCode = DEFAULT_LOCALE): JsonLdNode {
  return Object.fromEntries(
    Object.entries(node).filter(([, value]) => {
      if (value === null || value === undefined) return false
      if (typeof value === 'string') return value.trim() !== '' && !isPlaceholder(value, locale)
      if (Array.isArray(value)) return value.length > 0
      return true
    }),
  )
}

export function JsonLd({ data }: { data: JsonLdNode | JsonLdNode[] }) {
  const payload = Array.isArray(data) ? data : [data]
  if (payload.length === 0) return null

  return (
    <script
      type="application/ld+json"
      // Nội dung do CMS nhập nên phải chặn chuỗi `</script>` cắt sớm thẻ script.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(payload.length === 1 ? payload[0] : payload).replace(
          /</g,
          '\\u003c',
        ),
      }}
    />
  )
}

/**
 * Doanh nghiệp kế toán ở trang chủ. `AccountingService` là kiểu con của
 * `LocalBusiness`, cụ thể hơn nên Google hiểu đúng ngành hơn.
 *
 * `department`: mỗi chi nhánh một nút con. Chi nhánh thiếu địa chỉ bị bỏ —
 * LocalBusiness không có address là dữ liệu vô nghĩa với Google.
 */
export function accountingServiceJsonLd({
  siteName,
  description,
  logoUrl,
  hotlines,
  email,
  address,
  taxCode,
  sameAs,
  branches,
}: {
  siteName: string
  description?: string | null
  logoUrl?: string | null
  hotlines?: (string | null | undefined)[]
  email?: string | null
  address?: string | null
  taxCode?: string | null
  sameAs?: (string | null | undefined)[]
  branches?: { city: string; address: string; phone?: string | null; email?: string | null }[]
}): JsonLdNode {
  const phones = (hotlines ?? []).filter((v): v is string => !!v && v.trim() !== '')
  const links = (sameAs ?? []).filter((v): v is string => !!v && v.trim() !== '')

  const departments = (branches ?? [])
    .filter((branch) => branch.address && branch.address.trim() !== '' && !isPlaceholder(branch.address))
    .map((branch) =>
      compact({
        '@type': 'AccountingService',
        name: `${siteName} — ${branch.city}`,
        address: compact({ '@type': 'PostalAddress', streetAddress: branch.address }),
        telephone: branch.phone ?? undefined,
        email: branch.email ?? undefined,
      }),
    )

  return compact({
    '@context': 'https://schema.org',
    '@type': 'AccountingService',
    '@id': absoluteUrl('/#organization'),
    name: siteName,
    url: absoluteUrl('/'),
    description: description ?? undefined,
    logo: logoUrl ?? undefined,
    image: logoUrl ?? undefined,
    telephone: phones[0],
    // Số phụ khai thêm ở contactPoint để không mất thông tin khi có 2 hotline.
    contactPoint:
      phones.length > 1
        ? phones.slice(1).map((phone) =>
            compact({ '@type': 'ContactPoint', telephone: phone, contactType: 'customer service' }),
          )
        : undefined,
    email: email ?? undefined,
    address: address
      ? compact({ '@type': 'PostalAddress', streetAddress: address })
      : undefined,
    taxID: taxCode ?? undefined,
    sameAs: links,
    department: departments,
  })
}

/** Bài viết ở /tin-tuc/<slug>. Bài không khai tác giả → lấy tên site làm author. */
export function articleJsonLd({
  headline,
  url,
  description,
  imageUrl,
  datePublished,
  dateModified,
  authorName,
}: {
  headline: string
  url: string
  description?: string | null
  imageUrl?: string | null
  datePublished?: string | null
  dateModified?: string | null
  authorName: string
}): JsonLdNode {
  return compact({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    mainEntityOfPage: compact({ '@type': 'WebPage', '@id': url }),
    url,
    description: description ?? undefined,
    image: imageUrl ?? undefined,
    datePublished: datePublished ?? undefined,
    dateModified: dateModified ?? datePublished ?? undefined,
    author: compact({ '@type': 'Organization', name: authorName }),
    publisher: compact({ '@type': 'Organization', name: authorName }),
  })
}

/** Đường dẫn phân cấp cho các trang chi tiết. `item` phải là URL tuyệt đối. */
export function breadcrumbJsonLd(items: { name: string; path: string }[]): JsonLdNode {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}
