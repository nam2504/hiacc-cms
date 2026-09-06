/**
 * Lớp dịch cho chuỗi giao diện (nhãn nút, tiêu đề khối, thông báo form).
 * Chuỗi NỘI DUNG (bài viết, trang, dịch vụ) KHÔNG đi qua đây — nó nằm trong CMS
 * với `localized: true`.
 *
 * Ràng buộc khách chốt 30/08: cấm hardcode chuỗi tiếng Việt trong component.
 * Mọi nhãn giao diện phải gọi t('khoá'). Bật ngôn ngữ mới = thêm một object
 * bên dưới, KHÔNG sửa component.
 */
import { DEFAULT_LOCALE, type LocaleCode } from './locales'
import { TENANT } from '@/config/tenant'
import { en } from './i18n.en'

type Dict = Record<string, string>

const vi: Dict = {
  'nav.home': 'Trang chủ',
  'nav.about': 'Giới thiệu',
  'nav.services': 'Dịch vụ chuyên ngành',
  'nav.tools': 'Công cụ',
  'nav.tools.payroll': 'Tính lương Gross ↔ Net',
  'nav.contact': 'Liên hệ',
  'nav.news': 'Tin tức',

  'nav.menu.open': 'Mở menu',
  'nav.menu.close': 'Đóng menu',
  'nav.skipToContent': 'Bỏ qua, tới nội dung chính',
  'service.requestQuote': 'Yêu cầu báo phí',
  'service.viewOwnPage': 'Xem dạng trang riêng',
  'service.related': 'Có thể bạn quan tâm',
  'nav.serviceGroup': 'Nhóm dịch vụ',
  'nav.servicePage': 'Trang dịch vụ →',
  'nav.language': 'Ngôn ngữ',

  'common.readMore': 'Xem thêm',
  'common.viewAll': 'Xem tất cả',
  'common.backToHome': 'Về trang chủ',
  'common.loading': 'Đang tải…',
  'common.hotline': 'Hotline',
  'common.email': 'Email',
  'common.address': 'Địa chỉ',
  'common.taxCode': 'Mã số thuế',
  'common.viewMap': 'Xem bản đồ',

  'footer.about': 'Về chúng tôi',
  'footer.quickLinks': 'Liên kết nhanh',
  'footer.recentPosts': 'Bài viết gần đây',
  'footer.contact': 'Liên hệ',
  'footer.followUs': 'Theo dõi chúng tôi',

  // --- Trang chủ (W1) — AUDIT §3, khối 2–8 ---
  // Mọi số liệu marketing chép từ site tham chiếu site tham chiếu (điểm sao, số lượng
  // khách hàng, các mức phần trăm ở khối Stats) đã bị GỠ: không có nguồn nào kiểm
  // chứng được, mà tuyên bố định lượng của một công ty kế toán sai là rủi ro pháp lý.
  // Chỉ đưa lại khi khách tự cung cấp số thật kèm nguồn và chịu trách nhiệm về số đó.
  'home.hero.tagline': 'Đồng hành cùng doanh nghiệp Việt',
  // Không lặp lại cụm của tagline ("đồng hành cùng doanh nghiệp Việt") — hai dòng
  // đứng sát nhau trong hero, lặp nguyên cụm đọc rất lộ.
  'home.hero.lead':
    'Dịch vụ kế toán, thuế và tư vấn doanh nghiệp trọn gói cho doanh nghiệp vừa và nhỏ.',
  'home.hero.cta': 'Nhận tư vấn miễn phí',
  'home.hero.ctaSecondary': 'Xem dịch vụ',

  'home.stats.risk.value': 'Giảm thiểu',
  'home.stats.risk.label': 'rủi ro về thuế và sổ sách',
  'home.stats.efficiency.value': 'Nâng cao',
  'home.stats.efficiency.label': 'hiệu quả vận hành bộ máy kế toán',
  'home.stats.cost.value': 'Tối ưu',
  'home.stats.cost.label': 'chi phí vận hành so với kế toán nội bộ',

  'home.about.title': 'Về {brand}',
  'home.about.subtitle': 'Bốn lý do doanh nghiệp chọn {brand} làm đối tác kế toán.',
  'home.about.certification.title': 'Quy trình chuẩn hoá',
  'home.about.certification.body':
    'Quy trình làm việc chuẩn hoá theo thông lệ hành nghề kế toán, kiểm toán.',
  'home.about.team.title': 'Đội ngũ hành nghề',
  'home.about.team.body':
    'Đội ngũ chuyên viên kế toán, thuế đồng hành theo từng doanh nghiệp.',
  'home.about.legal.title': 'Pháp lý đầy đủ',
  'home.about.legal.body':
    'Hồ sơ pháp lý, giấy phép hành nghề và bảo hiểm trách nhiệm nghề nghiệp đầy đủ.',
  'home.about.support.title': 'Hỗ trợ 24/7',
  'home.about.support.body': 'Tư vấn viên trực suốt tuần, phản hồi trong ngày làm việc.',

  'home.services.title': 'Dịch vụ chuyên ngành',
  'home.services.subtitle':
    'Từ kế toán trọn gói tới quyết toán thuế — chọn đúng phần doanh nghiệp bạn cần.',

  'home.branches.title': 'Mạng lưới chi nhánh',
  'home.branches.subtitle': 'Có mặt tại các trung tâm kinh tế lớn trên cả nước.',

  'home.social.title': 'Kết nối với {brand}',
  'home.social.subtitle': 'Theo dõi kênh chính thức để nhận bản tin thuế và pháp luật mới nhất.',
  'home.social.facebook': 'Facebook',
  'home.social.tiktok': 'TikTok',
  'home.social.youtube': 'YouTube',
  'home.social.twitter': 'Twitter (X)',

  'home.knowledge.title': 'Trung tâm kiến thức',
  'home.knowledge.subtitle': 'Bài viết và văn bản pháp luật chia theo chuyên mục.',
  'home.knowledge.group.accounting': 'Kế toán & Doanh nghiệp',
  'home.knowledge.group.legal-hr': 'Pháp lý & Nhân sự',

  'home.services.viewAll': 'Xem tất cả dịch vụ',

  // Khối CTA cuối trang: trước đây toàn bộ trang chủ chỉ có 2 nút, cả hai nằm
  // trong Hero — 88% chiều dài trang không có điểm hành động nào.
  'home.cta.title': 'Cần tư vấn cho doanh nghiệp của bạn?',
  'home.cta.subtitle':
    'Gửi yêu cầu hoặc gọi trực tiếp, chúng tôi phản hồi trong ngày làm việc.',
  'home.cta.button': 'Nhận tư vấn miễn phí',

  // --- Trang Giới thiệu / Dịch vụ / Liên hệ (W2) ---
  // Seed để field `content` trống chờ khách tự viết, nên cần chuỗi giữ chỗ.
  'page.contentComingSoon': 'Nội dung đang được cập nhật. Vui lòng quay lại sau.',

  'services.listSubtitle':
    'Chọn dịch vụ phù hợp với doanh nghiệp của bạn — mỗi dịch vụ có mô tả chi tiết riêng.',
  'services.empty': 'Chưa có dịch vụ nào được đăng.',
  'services.sidebar.label': 'Danh sách hạng mục',
  'services.sidebar.title': 'Nội dung',
  'services.pricingTable.title': 'Bảng giá dịch vụ',
  'services.pricingTable.item': 'Hạng mục',
  'services.pricingTable.scope': 'Phạm vi công việc',
  'services.pricingTable.fee': 'Phí dịch vụ',
  'home.services.groupsTitle': 'Lĩnh vực hoạt động',
  'home.services.groupsSubtitle':
    'Từ kế toán trọn gói tới giấy phép hoạt động — chọn đúng phần doanh nghiệp bạn cần.',
  'home.services.groupDetail': 'Xem chi tiết →',
  'home.services.consultCta': 'Tư vấn miễn phí',
  'home.services.pricingCta': 'Bảng giá tổng hợp',
  'service.cta': 'Nhận tư vấn về dịch vụ này',
  'service.backToList': 'Xem tất cả dịch vụ',

  'contact.subtitle':
    'Liên hệ {brand} để được tư vấn miễn phí về kế toán, thuế và pháp lý doanh nghiệp.',
  'contact.headOffice': 'Trụ sở chính',
  'contact.branches.title': 'Mạng lưới chi nhánh',
  'contact.branches.subtitle': 'Chọn văn phòng gần bạn nhất để được hỗ trợ trực tiếp.',
  'branches.empty': 'Chưa có thông tin chi nhánh.',

  // --- Tin tức + Chuyên mục (W3) ---
  'news.list.title': 'Tin tức',
  'news.list.subtitle':
    'Bản tin thuế, kế toán và pháp luật doanh nghiệp — cập nhật bởi đội ngũ {brand}.',
  'news.list.latest': 'Bài mới',

  'news.categories.title': 'Chuyên mục',
  'news.categories.subtitle': 'Bài viết và văn bản pháp luật chia theo từng chuyên mục.',
  'news.categories.empty.title': 'Chưa có chuyên mục nào',
  'news.categories.empty.body': 'Danh mục đang được cập nhật, bạn quay lại sau nhé.',

  // V2 (REVIEW-visual.md §7①): khoá icon SVG ('newspaper' trong Icon.tsx), không còn emoji.
  'news.empty.icon': 'newspaper',
  'news.empty.title': 'Chưa có bài viết nào',
  'news.empty.body': 'Bài viết đang được biên soạn. Bạn có thể xem trước các chuyên mục có sẵn.',
  'news.empty.browseCategories': 'Xem chuyên mục',

  'news.category.empty.title': 'Chuyên mục này chưa có bài viết',
  'news.category.empty.body':
    'Nội dung đang được biên soạn. Trong lúc chờ, mời bạn xem các bài viết mới nhất.',
  'news.category.empty.allPosts': 'Xem tất cả bài viết',

  'news.post.contentPending': 'Nội dung bài viết đang được cập nhật.',
  'news.post.backToList': '← Về danh sách tin tức',

  'news.pagination.label': 'Phân trang bài viết',
  'news.pagination.prev': 'Trước',
  'news.pagination.next': 'Sau',
  'news.breadcrumb.label': 'Đường dẫn trang',

  // --- Form liên hệ + bản đồ chi nhánh (W7) ---
  'contact.form.title': 'Gửi yêu cầu tư vấn',
  'contact.form.subtitle':
    'Để lại thông tin, chuyên viên {brand} sẽ liên hệ lại trong giờ làm việc.',
  'contact.form.name.label': 'Họ và tên',
  'contact.form.name.placeholder': 'Nguyễn Văn A',
  'contact.form.phone.label': 'Số điện thoại',
  'contact.form.phone.placeholder': '0912 345 678',
  'contact.form.email.label': 'Email',
  'contact.form.email.placeholder': 'ban@congty.com',
  'contact.form.message.label': 'Nội dung cần tư vấn',
  'contact.form.message.placeholder': 'Doanh nghiệp của bạn đang cần hỗ trợ việc gì?',
  'contact.form.optional': '(không bắt buộc)',
  'contact.form.requiredMark': 'Bắt buộc',
  'contact.form.submit': 'Gửi yêu cầu',
  'contact.form.submitting': 'Đang gửi…',
  'contact.form.honeypot.label': 'Để trống ô này',
  'contact.form.success.title': 'Đã nhận được thông tin của bạn',
  'contact.form.success.body':
    'Cảm ơn bạn đã liên hệ {brand}. Chuyên viên sẽ gọi lại trong giờ làm việc.',
  'contact.form.success.again': 'Gửi yêu cầu khác',
  'contact.form.error.name': 'Vui lòng nhập họ và tên.',
  'contact.form.error.phone': 'Vui lòng nhập số điện thoại.',
  'contact.form.error.phoneFormat':
    'Số điện thoại chưa đúng. Nhập dạng 0912345678 hoặc +84912345678.',
  'contact.form.error.email': 'Email chưa đúng định dạng.',
  'contact.form.error.tooLong': 'Nội dung quá dài, vui lòng rút gọn.',
  'contact.form.error.rateLimit':
    'Bạn vừa gửi khá nhiều yêu cầu. Vui lòng thử lại sau ít phút hoặc gọi hotline.',
  'contact.form.error.duplicate': 'Yêu cầu này vừa được gửi rồi, bạn không cần gửi lại.',
  'contact.form.error.generic': 'Không gửi được yêu cầu lúc này. Vui lòng thử lại sau.',
  // [B1] Thay cho error.phoneFormat khi báo lỗi định dạng: nêu rõ cả số bàn và
  // tổng đài đều nhận được, để khách doanh nghiệp không tưởng mình gõ nhầm.
  // Khoá cũ `contact.form.error.phoneFormat` giữ nguyên, không xoá.
  'contact.form.error.phoneFormat.v2':
    'Số điện thoại chưa đúng. Nhận số di động (0912345678), số bàn (02838221234) và tổng đài (19006192).',
  // [B3] Câu tóm tắt đọc cho trình đọc màn hình sau khi bấm Gửi mà form còn lỗi.
  'contact.form.error.summary': 'Yêu cầu chưa gửi được. Vui lòng kiểm tra lại các ô được đánh dấu.',

  'branches.map.title': 'Bản đồ chi nhánh',
  'branches.map.show': 'Xem bản đồ',
  'branches.map.hide': 'Ẩn bản đồ',
  'branches.map.frameTitle': 'Bản đồ chi nhánh',

  'error.notFound.title': 'Không tìm thấy trang',
  'error.notFound.body': 'Trang bạn tìm không tồn tại hoặc đã được chuyển đi.',

  // --- SEO kỹ thuật (W6) ---
  // Chỉ dùng cho thẻ meta / OG / JSON-LD khi CMS chưa có dữ liệu — không hiện trên giao diện.
  'seo.siteName': 'Kế toán {brand}',
  'seo.home.title': 'Dịch vụ kế toán, thuế và tư vấn doanh nghiệp',
  'seo.breadcrumb.home': 'Trang chủ',
  // Seed điền chuỗi này vào field bắt buộc `branches.address` khi khách chưa cấp
  // địa chỉ thật. JSON-LD phải nhận ra để LOẠI, không gửi địa chỉ giả cho Google.
  'seo.placeholder.pending': 'Đang cập nhật',

  // --- Công cụ tính lương Gross ↔ Net (W5) ---
  // Số liệu luật KHÔNG nằm ở đây — nó nằm trong global `payroll-config` (/admin),
  // vì khách phải sửa được mà không cần deploy lại. Đây chỉ là nhãn giao diện.
  'payroll.title': 'Công cụ tính lương Gross ↔ Net',
  'payroll.subtitle':
    'Nhập lương Gross để xem lương Net thực nhận, hoặc nhập lương Net để suy ra lương Gross cần thoả thuận.',
  'payroll.seo.description':
    'Tính lương Gross sang Net và Net sang Gross theo biểu thuế thu nhập cá nhân và tỷ lệ bảo hiểm áp dụng từ 01/01/2026.',

  'payroll.direction.legend': 'Chiều tính',
  'payroll.direction.grossToNet': 'Gross → Net',
  'payroll.direction.netToGross': 'Net → Gross',

  'payroll.field.amount.gross': 'Lương Gross (đồng/tháng)',
  'payroll.field.amount.net': 'Lương Net (đồng/tháng)',
  'payroll.field.amount.hint': 'Nhập số tiền, ví dụ 30000000.',
  'payroll.field.dependents': 'Số người phụ thuộc',
  'payroll.field.dependents.hint': 'Số người phụ thuộc đã đăng ký giảm trừ gia cảnh. Không có thì để 0.',
  'payroll.field.region': 'Vùng lương tối thiểu',
  'payroll.field.region.hint':
    'Quyết định trần đóng bảo hiểm thất nghiệp. Không rõ thì để Vùng I (các thành phố lớn).',
  'payroll.field.region.option': 'Vùng',
  'payroll.field.customBase': 'Công ty đóng bảo hiểm trên mức lương khác',
  'payroll.field.customBase.hint':
    'Chỉ tích khi công ty đóng bảo hiểm trên mức thấp hơn lương thoả thuận. Bỏ trống thì đóng trên đúng lương Gross.',
  'payroll.field.insuranceBase': 'Mức lương đóng bảo hiểm (đồng/tháng)',

  'payroll.result.title': 'Kết quả bóc tách',
  'payroll.result.empty': 'Nhập số tiền để xem kết quả.',
  'payroll.result.item': 'Khoản mục',
  'payroll.result.amount': 'Số tiền',
  'payroll.result.gross': 'Lương Gross',
  'payroll.result.social': 'Bảo hiểm xã hội (BHXH)',
  'payroll.result.health': 'Bảo hiểm y tế (BHYT)',
  'payroll.result.unemployment': 'Bảo hiểm thất nghiệp (BHTN)',
  'payroll.result.totalInsurance': 'Tổng bảo hiểm người lao động đóng',
  'payroll.result.incomeBeforeTax': 'Thu nhập trước thuế',
  'payroll.result.deduction': 'Giảm trừ gia cảnh',
  'payroll.result.deduction.personal': 'bản thân',
  'payroll.result.deduction.dependents': 'người phụ thuộc',
  'payroll.result.taxableIncome': 'Thu nhập tính thuế',
  'payroll.result.tax': 'Thuế thu nhập cá nhân',
  'payroll.result.net': 'Lương Net thực nhận',
  'payroll.result.capped': 'đã chạm trần đóng bảo hiểm',

  'payroll.brackets.title': 'Thuế đã tính theo từng bậc',
  'payroll.brackets.hint':
    'Mỗi bậc chỉ áp thuế suất cho phần thu nhập nằm trong bậc đó. Cộng cột cuối ra đúng số thuế ở bảng trên.',
  'payroll.brackets.level': 'Bậc',
  'payroll.brackets.range': 'Phần thu nhập tính thuế',
  'payroll.brackets.rate': 'Thuế suất',
  'payroll.brackets.portion': 'Số tiền trong bậc',
  'payroll.brackets.tax': 'Thuế của bậc',
  'payroll.brackets.none': 'Thu nhập tính thuế bằng 0 nên không phát sinh thuế.',
  'payroll.brackets.above': 'trở lên',

  'payroll.legal.title': 'Số liệu đang áp dụng',
  'payroll.legal.effectiveFrom': 'Áp dụng từ',
  'payroll.legal.basis': 'Căn cứ pháp lý',

  'payroll.disclaimer.title': 'Lưu ý quan trọng',
  'payroll.disclaimer.body':
    'Kết quả trên chỉ mang tính tham khảo, không thay thế tư vấn thuế hay kế toán chuyên nghiệp. Số liệu áp dụng theo quy định có hiệu lực từ 01/01/2026 và có thể thay đổi. Vui lòng đối chiếu với hợp đồng lao động và cơ quan thuế trước khi sử dụng cho mục đích chính thức.',
  'payroll.privacy':
    'Toàn bộ phép tính chạy ngay trên trình duyệt của bạn. Số lương bạn nhập không được gửi đi đâu và không được lưu lại.',

  /* Thông báo lỗi ô nhập + tóm tắt cho screen reader (gói F3 — chỉ THÊM khoá mới). */
  'payroll.error.amount.invalid':
    'Không đọc được số tiền này. Bạn có thể nhập 30000000 hoặc 30.000.000.',
  'payroll.error.amount.negative': 'Số tiền không thể là số âm. Hãy nhập một số lớn hơn 0.',
  'payroll.error.dependents.invalid':
    'Số người phụ thuộc phải là số nguyên từ 0 trở lên. Không có thì nhập 0.',
  'payroll.error.dependents.rounded': 'Đang tính với số người phụ thuộc làm tròn xuống:',
  'payroll.result.summary.net': 'Lương Net thực nhận',
  'payroll.result.summary.gross': 'Lương Gross cần thoả thuận',
  'payroll.brackets.card.level': 'Bậc',
  'nav.secondaryLinks': 'Liên kết phụ',
  'nav.pricing': 'Bảng giá',
  'pricing.pending.title': 'Bảng giá đang được cập nhật',
  'pricing.pending.body':
    'Biểu phí từng dịch vụ đang được hoàn thiện. Trong lúc chờ, gọi hotline hoặc gửi yêu cầu để nhận báo giá đúng theo quy mô doanh nghiệp của bạn.',
  'nav.legalDocs': 'Văn bản pháp luật',
  'nav.newsletter': 'Bản tin',
  'about.profile.title': 'Hồ sơ công ty',
  'about.profile.companyName': 'Tên công ty',
  'about.profile.taxCode': 'Mã số thuế',
  'about.profile.headOffice': 'Trụ sở',
  'about.profile.field': 'Lĩnh vực',
  'about.principles.title': 'Nguyên tắc hành nghề',

}

/**
 * Giai đoạn 2: điền zh/en/ko. Thiếu khoá nào thì rơi về tiếng Việt —
 * site không bao giờ hiện khoá thô ra màn hình.
 */
const DICTIONARIES: Record<LocaleCode, Dict> = {
  vi,
  zh: {},
  en,
  ko: {},
}

export function getDictionary(locale: LocaleCode = DEFAULT_LOCALE): Dict {
  return { ...vi, ...DICTIONARIES[locale] }
}

/** t('nav.home') → 'Trang chủ'. Khoá lạ trả về chính nó để lỗi lộ ra khi review. */
export function createTranslator(locale: LocaleCode = DEFAULT_LOCALE) {
  const dict = getDictionary(locale)
  /**
   * `{brand}` trong chuỗi dịch được thay bằng tên thương hiệu của tenant.
   * Vì sao không lấy từ Settings: t() là hàm đồng bộ, không đọc được DB. Chỗ nào
   * cần đúng tên khách vừa sửa trong /admin thì component tự truyền qua tham số
   * `vars` — xem `brandName()` trong src/config/tenant.ts.
   */
  return (key: string, vars?: Record<string, string>): string => {
    const raw = dict[key] ?? key
    const brand = vars?.brand ?? TENANT.name
    return raw.replace(/\{brand\}/g, brand).replace(/\{(\w+)\}/g, (m, k) => vars?.[k] ?? m)
  }
}

/** Dùng nhanh ở component server khi chỉ có 1 ngôn ngữ. */
export const t = createTranslator(DEFAULT_LOCALE)
