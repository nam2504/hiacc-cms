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
  // Số liệu marketing lấy từ site tham chiếu hiacc.com.vn, chờ khách xác nhận.
  'home.hero.tagline': "You're in good hands",
  'home.hero.lead':
    'Dịch vụ kế toán, thuế và tư vấn doanh nghiệp trọn gói — đồng hành cùng doanh nghiệp Việt.',
  'home.hero.ratingValue': '4.9',
  'home.hero.ratingLabel': 'Từ 6879 khách hàng',
  'home.hero.ratingAria': 'Đánh giá 4.9 trên 5 sao',
  'home.hero.cta': 'Nhận tư vấn miễn phí',
  'home.hero.ctaSecondary': 'Xem dịch vụ',

  'home.stats.risk.value': 'Giảm 98%',
  'home.stats.risk.label': 'rủi ro về thuế và sổ sách',
  'home.stats.efficiency.value': 'Tăng 85%',
  'home.stats.efficiency.label': 'hiệu quả vận hành bộ máy kế toán',
  'home.stats.cost.value': 'Tiết kiệm 75%',
  'home.stats.cost.label': 'chi phí so với kế toán nội bộ',

  'home.about.title': 'Về HIACC',
  'home.about.subtitle': 'Bốn lý do doanh nghiệp chọn HiACC làm đối tác kế toán.',
  'home.about.certification.title': 'Chứng nhận quốc tế',
  'home.about.certification.body':
    'Top 10 đơn vị tư vấn kế toán châu Á – Thái Bình Dương liên tục từ năm 2019.',
  'home.about.team.title': 'Đội ngũ hành nghề',
  'home.about.team.body': '100% nhân sự có chứng chỉ hành nghề kế toán, thuế.',
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

  'home.social.title': 'Kết nối với HiACC',
  'home.social.subtitle': 'Theo dõi kênh chính thức để nhận bản tin thuế và pháp luật mới nhất.',
  'home.social.facebook': 'Facebook',
  'home.social.tiktok': 'TikTok',
  'home.social.youtube': 'YouTube',
  'home.social.twitter': 'Twitter (X)',

  'home.knowledge.title': 'Trung tâm kiến thức',
  'home.knowledge.subtitle': 'Bài viết và văn bản pháp luật chia theo chuyên mục.',
  'home.knowledge.group.accounting': 'Kế toán & Doanh nghiệp',
  'home.knowledge.group.legal-hr': 'Pháp lý & Nhân sự',

  // --- Trang Giới thiệu / Dịch vụ / Liên hệ (W2) ---
  // Seed để field `content` trống chờ khách tự viết, nên cần chuỗi giữ chỗ.
  'page.contentComingSoon': 'Nội dung đang được cập nhật. Vui lòng quay lại sau.',

  'services.listSubtitle':
    'Chọn dịch vụ phù hợp với doanh nghiệp của bạn — mỗi dịch vụ có mô tả chi tiết riêng.',
  'services.empty': 'Chưa có dịch vụ nào được đăng.',
  'service.cta': 'Nhận tư vấn về dịch vụ này',
  'service.backToList': 'Xem tất cả dịch vụ',

  'contact.subtitle':
    'Liên hệ HiACC để được tư vấn miễn phí về kế toán, thuế và pháp lý doanh nghiệp.',
  'contact.headOffice': 'Trụ sở chính',
  'contact.branches.title': 'Mạng lưới chi nhánh',
  'contact.branches.subtitle': 'Chọn văn phòng gần bạn nhất để được hỗ trợ trực tiếp.',
  'branches.empty': 'Chưa có thông tin chi nhánh.',

  // --- Tin tức + Chuyên mục (W3) ---
  'news.list.title': 'Tin tức',
  'news.list.subtitle':
    'Bản tin thuế, kế toán và pháp luật doanh nghiệp — cập nhật bởi đội ngũ HiACC.',

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
    'Để lại thông tin, chuyên viên HiACC sẽ liên hệ lại trong giờ làm việc.',
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
    'Cảm ơn bạn đã liên hệ HiACC. Chuyên viên sẽ gọi lại trong giờ làm việc.',
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
  'seo.siteName': 'Kế toán HiACC',
  'seo.home.title': 'Dịch vụ kế toán, thuế và tư vấn doanh nghiệp',
  'seo.breadcrumb.home': 'Trang chủ',
  // Seed điền chuỗi này vào field bắt buộc `branches.address` khi khách chưa cấp
  // địa chỉ thật. JSON-LD phải nhận ra để LOẠI, không gửi địa chỉ giả cho Google.
  'seo.placeholder.pending': 'Đang cập nhật',
}

/**
 * Giai đoạn 2: điền zh/en/ko. Thiếu khoá nào thì rơi về tiếng Việt —
 * site không bao giờ hiện khoá thô ra màn hình.
 */
const DICTIONARIES: Record<LocaleCode, Dict> = {
  vi,
  zh: {},
  en: {},
  ko: {},
}

export function getDictionary(locale: LocaleCode = DEFAULT_LOCALE): Dict {
  return { ...vi, ...DICTIONARIES[locale] }
}

/** t('nav.home') → 'Trang chủ'. Khoá lạ trả về chính nó để lỗi lộ ra khi review. */
export function createTranslator(locale: LocaleCode = DEFAULT_LOCALE) {
  const dict = getDictionary(locale)
  return (key: string): string => dict[key] ?? key
}

/** Dùng nhanh ở component server khi chỉ có 1 ngôn ngữ. */
export const t = createTranslator(DEFAULT_LOCALE)
