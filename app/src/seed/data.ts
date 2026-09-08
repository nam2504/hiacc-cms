/**
 * Nội dung mẫu, rút từ AUDIT-hiacc.com.vn.md (site tham chiếu).
 *
 * ⚠️ Đây là NỘI DUNG MẪU để dựng giao diện và demo, KHÔNG phải nội dung chính thức.
 * Khách tự viết nội dung thật (chốt 30/08) rồi sửa trong admin.
 * Số điện thoại / email / địa chỉ dưới đây là placeholder — phải khách xác nhận.
 *
 * ⚠️ Gói C1 (đợt 6): thêm `content`/`summary`/`body` cho posts/pages/services.
 * Toàn bộ đoạn văn là NỘI DUNG MẪU tự viết, không trích dẫn số liệu/thuế suất/thông
 * tư cụ thể — xem contract C1-seed-content.md §0. Muốn xoá sạch nội dung mẫu:
 * xoá theo danh sách slug trong báo cáo bàn giao gói C1.
 */

// ---------------------------------------------------------------------------
// Helper dựng Lexical richText JSON tối thiểu (editor mặc định của Payload).
// Không thêm dependency, không đổi kiến trúc — chỉ build đúng object mà
// @payloadcms/richtext-lexical mong đợi cho field `richText`.
// ---------------------------------------------------------------------------

type LexicalNode = Record<string, unknown>

const textNode = (text: string, format = 0): LexicalNode => ({
  type: 'text',
  version: 1,
  detail: 0,
  format,
  mode: 'normal',
  style: '',
  text,
})

const paragraph = (text: string): LexicalNode => ({
  type: 'paragraph',
  version: 1,
  format: '',
  indent: 0,
  direction: 'ltr',
  children: [textNode(text)],
})

const heading = (tag: 'h2' | 'h3', text: string): LexicalNode => ({
  type: 'heading',
  version: 1,
  tag,
  format: '',
  indent: 0,
  direction: 'ltr',
  children: [textNode(text)],
})

const listItem = (text: string, value: number): LexicalNode => ({
  type: 'listitem',
  version: 1,
  value,
  format: '',
  indent: 0,
  direction: 'ltr',
  children: [textNode(text)],
})

const bulletList = (items: string[]): LexicalNode => ({
  type: 'list',
  version: 1,
  tag: 'ul',
  listType: 'bullet',
  start: 1,
  format: '',
  indent: 0,
  direction: 'ltr',
  children: items.map((t, i) => listItem(t, i + 1)),
})

/** Đoạn văn nhỏ, in nghiêng, dùng làm ghi chú "đây là nội dung mẫu" cuối bài. */
const sampleNotice = (): LexicalNode => ({
  type: 'paragraph',
  version: 1,
  format: '',
  indent: 0,
  direction: 'ltr',
  children: [textNode('[Nội dung mẫu — khách sẽ thay bằng bài viết chính thức trước khi đăng.]', 2)], // format 2 = italic
})

/**
 * Build field richText hoàn chỉnh từ danh sách node cấp gốc.
 * Ép kiểu `any`: type Lexical chính thức của Payload rất chặt (union literal cho
 * format/direction…) trong khi ta chỉ cần đúng shape JSON runtime mà editor đọc được.
 * Không đổi field/behaviour, chỉ nới kiểu tại điểm build dữ liệu seed.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const richText = (nodes: LexicalNode[]): any => ({
  root: {
    type: 'root',
    version: 1,
    format: '',
    indent: 0,
    direction: 'ltr',
    children: nodes,
  },
})

// ---------------------------------------------------------------------------

export const CATEGORIES = [
  // Nhóm Kế toán & Doanh nghiệp — AUDIT §3.8
  { name: 'Bản tin pháp luật', slug: 'ban-tin-phap-luat', group: 'accounting', order: 1 },
  { name: 'Kế toán tài chính', slug: 'ke-toan-tai-chinh', group: 'accounting', order: 2 },
  { name: 'Các loại thuế', slug: 'cac-loai-thue', group: 'accounting', order: 3 },
  { name: 'Phần mềm kế toán', slug: 'phan-mem-ke-toan', group: 'accounting', order: 4 },
  { name: 'Doanh nghiệp', slug: 'doanh-nghiep', group: 'accounting', order: 5 },
  { name: 'Đầu tư nước ngoài', slug: 'dau-tu-nuoc-ngoai', group: 'accounting', order: 6 },
  { name: 'Công cụ', slug: 'cong-cu', group: 'accounting', order: 7 },
  // Nhóm Pháp lý & Nhân sự
  { name: 'Bảo hiểm xã hội', slug: 'bao-hiem-xa-hoi', group: 'legal-hr', order: 8 },
  { name: 'Bảo hiểm thai sản', slug: 'bao-hiem-thai-san', group: 'legal-hr', order: 9 },
  { name: 'Bảo hiểm thất nghiệp', slug: 'bao-hiem-that-nghiep', group: 'legal-hr', order: 10 },
  { name: 'Văn bản pháp luật', slug: 'van-ban-phap-luat', group: 'legal-hr', order: 11 },
  { name: 'Tuyển dụng', slug: 'tuyen-dung', group: 'legal-hr', order: 12 },
] as const

// icon: KHOÁ icon (không phải emoji) — bộ khoá định nghĩa ở components/ui/Icon.tsx.
// Khoá lạ/rỗng → icon mặc định, không vỡ layout.
export const SERVICES = [
  {
    name: 'Kế toán trọn gói',
    slug: 'ke-toan-tron-goi',
    icon: 'chart',
    summary: 'Nhận toàn bộ công việc kế toán hàng tháng: sổ sách, kê khai, báo cáo thuế.',
    content: richText([
      paragraph(
        'Dịch vụ kế toán trọn gói dành cho doanh nghiệp không có bộ phận kế toán riêng hoặc muốn thuê ngoài để tập trung vào hoạt động kinh doanh chính. Đội ngũ HiACC đảm nhận toàn bộ công việc ghi sổ, kê khai và báo cáo định kỳ theo quy định.',
      ),
      heading('h2', 'Phạm vi công việc'),
      bulletList([
        'Thu thập, kiểm tra và hạch toán chứng từ phát sinh hàng tháng.',
        'Lập và nộp các tờ khai thuế định kỳ theo quy định hiện hành.',
        'Theo dõi công nợ, hàng tồn kho, tài sản cố định trên sổ sách.',
        'Tư vấn xử lý các tình huống phát sinh trong quá trình hạch toán.',
      ]),
      heading('h2', 'Quy trình phối hợp'),
      paragraph(
        'Doanh nghiệp gửi chứng từ định kỳ (bản giấy hoặc bản scan) theo lịch đã thống nhất. HiACC hạch toán, đối chiếu và phản hồi các điểm cần bổ sung trước khi lập tờ khai. Báo cáo được gửi lại để doanh nghiệp rà soát trước khi nộp cơ quan quản lý.',
      ),
      heading('h3', 'Hồ sơ cần chuẩn bị khi bắt đầu'),
      bulletList([
        'Giấy chứng nhận đăng ký doanh nghiệp và các giấy phép con (nếu có).',
        'Sổ sách kế toán, báo cáo thuế các kỳ gần nhất (nếu doanh nghiệp đã hoạt động).',
        'Thông tin tài khoản ngân hàng và chữ ký số dùng để nộp tờ khai.',
      ]),
      paragraph(
        'Quy trình và biểu mẫu cụ thể có thể thay đổi tuỳ loại hình doanh nghiệp và ngành nghề — HiACC sẽ tư vấn chi tiết theo từng trường hợp. [Dẫn văn bản — khách xác nhận số hiệu]',
      ),
      sampleNotice(),
    ]),
    order: 1,
  },
  {
    name: 'Kế toán nội bộ',
    slug: 'ke-toan-noi-bo',
    icon: 'folder',
    summary: 'Xây dựng và vận hành hệ thống sổ sách quản trị phục vụ điều hành doanh nghiệp.',
    content: richText([
      paragraph(
        'Kế toán nội bộ (kế toán quản trị) phục vụ nhu cầu điều hành thực tế của chủ doanh nghiệp, khác với sổ sách nộp cơ quan thuế. HiACC hỗ trợ xây dựng hệ thống theo dõi phù hợp với đặc thù hoạt động của từng đơn vị.',
      ),
      heading('h2', 'Phạm vi công việc'),
      bulletList([
        'Thiết kế hệ thống tài khoản và biểu mẫu theo dõi phù hợp mô hình kinh doanh.',
        'Ghi nhận doanh thu, chi phí thực tế theo dòng tiền và theo bộ phận.',
        'Lập báo cáo quản trị định kỳ để chủ doanh nghiệp theo dõi hiệu quả hoạt động.',
      ]),
      heading('h2', 'Vì sao cần tách bạch với sổ sách thuế'),
      paragraph(
        'Sổ sách kế toán thuế phải tuân theo chuẩn mực và quy định báo cáo bắt buộc, trong khi sổ nội bộ linh hoạt hơn để phục vụ ra quyết định. Việc có cả hai giúp chủ doanh nghiệp nhìn được bức tranh thực tế mà vẫn đảm bảo tuân thủ.',
      ),
      heading('h3', 'Hồ sơ cần chuẩn bị'),
      bulletList([
        'Danh sách các khoản thu, chi phát sinh thường xuyên trong hoạt động.',
        'Cơ cấu tổ chức, bộ phận (nếu cần báo cáo theo bộ phận).',
      ]),
      sampleNotice(),
    ]),
    order: 2,
  },
  {
    name: 'Soát xét hồ sơ',
    slug: 'soat-xet-ho-so',
    icon: 'search',
    summary: 'Rà soát chứng từ, sổ sách trước quyết toán để phát hiện sai sót và rủi ro.',
    content: richText([
      paragraph(
        'Trước các kỳ quyết toán hoặc thanh tra, việc rà soát lại chứng từ và sổ sách giúp doanh nghiệp phát hiện sớm các điểm chưa khớp, tránh bị động khi làm việc với cơ quan quản lý.',
      ),
      heading('h2', 'Phạm vi công việc'),
      bulletList([
        'Đối chiếu chứng từ gốc với sổ sách và báo cáo đã lập.',
        'Kiểm tra tính hợp lệ, hợp lý của chứng từ đầu vào, đầu ra.',
        'Lập danh mục các điểm cần bổ sung hoặc điều chỉnh trước quyết toán.',
      ]),
      heading('h2', 'Kết quả bàn giao'),
      paragraph(
        'Sau khi soát xét, doanh nghiệp nhận được báo cáo tổng hợp các sai sót/rủi ro đã phát hiện kèm đề xuất hướng xử lý, làm cơ sở để chuẩn bị hồ sơ quyết toán đầy đủ hơn.',
      ),
      sampleNotice(),
    ]),
    order: 3,
  },
  {
    name: 'Quyết toán thuế',
    slug: 'quyet-toan-thue',
    icon: 'document',
    summary: 'Chuẩn bị hồ sơ và đại diện làm việc với cơ quan thuế khi quyết toán.',
    content: richText([
      paragraph(
        'Khi doanh nghiệp có yêu cầu quyết toán thuế (định kỳ hoặc theo quyết định thanh tra, kiểm tra), việc chuẩn bị hồ sơ đầy đủ và làm việc đúng quy trình với cơ quan thuế giúp giảm thiểu rủi ro và thời gian xử lý.',
      ),
      heading('h2', 'Phạm vi công việc'),
      bulletList([
        'Rà soát và sắp xếp hồ sơ, chứng từ theo yêu cầu quyết toán.',
        'Chuẩn bị giải trình cho các nghiệp vụ phát sinh trong kỳ.',
        'Đại diện hoặc hỗ trợ doanh nghiệp làm việc trực tiếp với cơ quan thuế.',
      ]),
      heading('h3', 'Hồ sơ cần chuẩn bị'),
      bulletList([
        'Toàn bộ sổ sách kế toán và báo cáo thuế của kỳ được quyết toán.',
        'Hợp đồng, chứng từ thanh toán liên quan đến các giao dịch lớn.',
        'Quyết định thanh tra/kiểm tra (nếu có) từ cơ quan thuế.',
      ]),
      paragraph(
        'Thời hạn và trình tự làm việc cụ thể theo thông báo của cơ quan thuế trong từng đợt quyết toán. [Dẫn văn bản — khách xác nhận số hiệu]',
      ),
      sampleNotice(),
    ]),
    order: 4,
  },
  {
    name: 'Hoàn thuế GTGT',
    slug: 'hoan-thue-gtgt',
    icon: 'finance',
    summary: 'Lập hồ sơ hoàn thuế giá trị gia tăng và theo dõi tới khi nhận được tiền hoàn.',
    content: richText([
      paragraph(
        'Doanh nghiệp thuộc diện được hoàn thuế giá trị gia tăng cần chuẩn bị hồ sơ đúng quy định và theo dõi tiến trình xử lý tại cơ quan thuế. HiACC hỗ trợ từ khâu chuẩn bị hồ sơ đến khi nhận được quyết định hoàn thuế.',
      ),
      heading('h2', 'Phạm vi công việc'),
      bulletList([
        'Rà soát điều kiện và xác định trường hợp đủ điều kiện hoàn thuế.',
        'Chuẩn bị hồ sơ đề nghị hoàn thuế theo mẫu quy định.',
        'Theo dõi tiến trình xử lý và phối hợp giải trình khi cơ quan thuế yêu cầu.',
      ]),
      heading('h3', 'Hồ sơ cần chuẩn bị'),
      bulletList([
        'Hoá đơn, chứng từ đầu vào, đầu ra liên quan đến kỳ đề nghị hoàn thuế.',
        'Tờ khai thuế GTGT các kỳ liên quan.',
        'Hợp đồng, chứng từ thanh toán qua ngân hàng cho các giao dịch liên quan.',
      ]),
      paragraph('Điều kiện và thủ tục hoàn thuế cụ thể áp dụng theo quy định hiện hành. [Dẫn văn bản — khách xác nhận số hiệu]'),
      sampleNotice(),
    ]),
    order: 5,
  },
  {
    name: 'Quyết toán giải thể',
    slug: 'quyet-toan-giai-the',
    icon: 'archive',
    summary: 'Xử lý nghĩa vụ thuế và hồ sơ pháp lý khi doanh nghiệp ngừng hoạt động.',
    content: richText([
      paragraph(
        'Khi doanh nghiệp ngừng hoạt động, cần hoàn tất quyết toán thuế và thủ tục pháp lý trước khi được cơ quan đăng ký kinh doanh chấp thuận giải thể. Đây là giai đoạn dễ phát sinh vướng mắc nếu hồ sơ nhiều năm chưa được rà soát.',
      ),
      heading('h2', 'Phạm vi công việc'),
      bulletList([
        'Rà soát sổ sách, nghĩa vụ thuế qua các kỳ hoạt động trước đó.',
        'Chuẩn bị hồ sơ quyết toán thuế phục vụ thủ tục giải thể.',
        'Hỗ trợ chuẩn bị hồ sơ pháp lý nộp cơ quan đăng ký kinh doanh.',
      ]),
      heading('h3', 'Hồ sơ cần chuẩn bị'),
      bulletList([
        'Toàn bộ sổ sách kế toán, báo cáo thuế từ khi thành lập hoặc từ lần quyết toán gần nhất.',
        'Biên bản họp/quyết định về việc giải thể của chủ sở hữu hoặc hội đồng thành viên.',
        'Con dấu, giấy chứng nhận đăng ký doanh nghiệp và các giấy phép liên quan.',
      ]),
      sampleNotice(),
    ]),
    order: 6,
  },
  {
    name: 'Báo cáo tài chính',
    slug: 'bao-cao-tai-chinh',
    icon: 'growth',
    summary: 'Lập báo cáo tài chính năm đúng chuẩn mực, đúng hạn nộp.',
    content: richText([
      paragraph(
        'Báo cáo tài chính năm là tài liệu bắt buộc phản ánh tình hình tài sản, nguồn vốn và kết quả kinh doanh của doanh nghiệp trong kỳ. HiACC hỗ trợ lập báo cáo dựa trên sổ sách đã được đối chiếu, đảm bảo tính nhất quán qua các kỳ.',
      ),
      heading('h2', 'Phạm vi công việc'),
      bulletList([
        'Tổng hợp và đối chiếu số liệu từ sổ sách kế toán trong năm.',
        'Lập bộ báo cáo tài chính gồm bảng cân đối kế toán, báo cáo kết quả kinh doanh, báo cáo lưu chuyển tiền tệ và thuyết minh.',
        'Rà soát tính hợp lý giữa các báo cáo trước khi nộp.',
      ]),
      heading('h2', 'Lưu ý khi chuẩn bị'),
      paragraph(
        'Việc đối chiếu số liệu nên thực hiện xuyên suốt trong năm thay vì dồn vào cuối kỳ, giúp giảm sai sót và rút ngắn thời gian lập báo cáo. Doanh nghiệp mới thành lập hoặc mới đổi đơn vị kế toán nên rà soát lại số dư đầu kỳ trước khi lập báo cáo.',
      ),
      paragraph('Hạn nộp và mẫu biểu báo cáo cụ thể áp dụng theo quy định hiện hành. [Dẫn văn bản — khách xác nhận số hiệu]'),
      sampleNotice(),
    ]),
    order: 7,
  },
] as const

/** 5 chi nhánh — AUDIT §3.6. Email/phone là placeholder, chờ khách xác nhận. */
export const BRANCHES = [
  { city: 'TP. Hồ Chí Minh', address: 'Đang cập nhật', order: 1 },
  { city: 'Hà Nội', address: 'Đang cập nhật', order: 2 },
  { city: 'Bắc Ninh', address: 'Đang cập nhật', order: 3 },
  { city: 'Đà Nẵng', address: 'Đang cập nhật', order: 4 },
  { city: 'Nghệ An', address: 'Đang cập nhật', order: 5 },
] as const

/** Trang tĩnh — nội dung mẫu để khách điền, W2 render. */
export const PAGES = [
  {
    title: 'Giới thiệu',
    slug: 'gioi-thieu',
    content: richText([
      paragraph(
        'HiACC là công ty cung cấp dịch vụ kế toán, thuế và tư vấn doanh nghiệp, đồng hành cùng khách hàng từ giai đoạn thành lập đến vận hành ổn định. Đoạn giới thiệu này là nội dung mẫu — khách sẽ thay bằng câu chuyện thương hiệu chính thức.',
      ),
      heading('h2', 'Lĩnh vực hoạt động'),
      bulletList([
        'Kế toán trọn gói và kế toán nội bộ cho doanh nghiệp vừa và nhỏ.',
        'Tư vấn và xử lý hồ sơ thuế: quyết toán, hoàn thuế GTGT.',
        'Soát xét hồ sơ và hỗ trợ thủ tục quyết toán khi giải thể.',
      ]),
      heading('h2', 'Đội ngũ'),
      paragraph(
        'Mỗi khách hàng có một chuyên viên phụ trách xuyên suốt hồ sơ, chịu trách nhiệm về tiến độ và nội dung bàn giao.',
      ),
      heading('h2', 'Giá trị cốt lõi'),
      paragraph(
        'Tuân thủ trước tối ưu: mọi phương án đều được đặt trong khuôn khổ pháp luật hiện hành; phần tối ưu chi phí chỉ xét sau khi điều kiện tuân thủ được bảo đảm.',
      ),
      paragraph(
        'Phí báo trước, không phát sinh: biểu phí và lệ phí nhà nước được thông báo bằng văn bản trước khi thực hiện thủ tục.',
      ),
      sampleNotice(),
    ]),
  },
  {
    title: 'Liên hệ',
    slug: 'lien-he',
    content: richText([
      paragraph(
        'Quý khách có thể liên hệ HiACC qua thông tin chi nhánh gần nhất hoặc để lại thông tin qua biểu mẫu liên hệ trên website, đội ngũ sẽ phản hồi trong thời gian sớm nhất.',
      ),
      sampleNotice(),
    ]),
  },
] as const

/** Bài mẫu — tiêu đề lấy từ bài thật thấy trên site cũ (AUDIT §3), content tự viết mới cho gói C1. */
export const POSTS = [
  {
    title: 'Mẫu hồ sơ giải thể doanh nghiệp',
    slug: 'mau-ho-so-giai-the-doanh-nghiep',
    categorySlug: 'doanh-nghiep',
    publishedAt: '2025-06-10T09:00:00.000Z',
    excerpt: 'Danh mục giấy tờ cần chuẩn bị khi doanh nghiệp làm thủ tục giải thể.',
    content: richText([
      paragraph(
        'Giải thể doanh nghiệp là thủ tục pháp lý nhằm chấm dứt sự tồn tại của doanh nghiệp, đi kèm nghĩa vụ hoàn tất quyết toán thuế và các trách nhiệm còn tồn đọng. Việc chuẩn bị hồ sơ đầy đủ ngay từ đầu giúp rút ngắn thời gian xử lý.',
      ),
      heading('h2', 'Các bước chính'),
      bulletList([
        'Thông qua quyết định giải thể tại doanh nghiệp.',
        'Thông báo giải thể tới cơ quan đăng ký kinh doanh và các bên liên quan.',
        'Thanh toán các khoản nợ, hoàn tất nghĩa vụ với người lao động.',
        'Quyết toán thuế với cơ quan thuế quản lý trực tiếp.',
        'Nộp hồ sơ đề nghị giải thể và chờ kết quả.',
      ]),
      heading('h2', 'Hồ sơ cần chuẩn bị'),
      bulletList([
        'Quyết định và biên bản họp về việc giải thể doanh nghiệp.',
        'Danh sách chủ nợ và số nợ đã thanh toán (nếu có).',
        'Xác nhận không nợ thuế hải quan (đối với doanh nghiệp có hoạt động xuất nhập khẩu).',
        'Con dấu và giấy chứng nhận đăng ký doanh nghiệp.',
      ]),
      heading('h3', 'Những điểm dễ bị chậm hồ sơ'),
      paragraph(
        'Phần lớn thời gian xử lý giải thể kéo dài do sổ sách kế toán các năm trước chưa được đối chiếu đầy đủ, hoặc doanh nghiệp còn nghĩa vụ thuế/bảo hiểm chưa hoàn tất. Rà soát sớm các khoản này trước khi nộp hồ sơ sẽ giúp quy trình suôn sẻ hơn.',
      ),
      paragraph('Trình tự, thời hạn và mẫu biểu cụ thể áp dụng theo quy định hiện hành. [Dẫn văn bản — khách xác nhận số hiệu]'),
      heading('h2', 'Kết'),
      paragraph(
        'Doanh nghiệp nên chủ động rà soát sổ sách và nghĩa vụ thuế trước khi quyết định giải thể, để tránh phát sinh vướng mắc kéo dài thời gian xử lý.',
      ),
      sampleNotice(),
    ]),
  },
  {
    title: 'Sổ sách kế toán',
    slug: 'so-sach-ke-toan',
    categorySlug: 'ke-toan-tai-chinh',
    publishedAt: '2025-06-09T09:00:00.000Z',
    excerpt: 'Các loại sổ sách kế toán doanh nghiệp bắt buộc phải lưu giữ.',
    content: richText([
      paragraph(
        'Sổ sách kế toán là hệ thống ghi chép các nghiệp vụ kinh tế phát sinh trong doanh nghiệp, làm căn cứ lập báo cáo tài chính và báo cáo thuế. Việc lưu giữ sổ sách đầy đủ, đúng quy định là nghĩa vụ bắt buộc của mọi doanh nghiệp.',
      ),
      heading('h2', 'Các loại sổ sách phổ biến'),
      bulletList([
        'Sổ nhật ký chung, sổ cái các tài khoản.',
        'Sổ chi tiết công nợ phải thu, phải trả.',
        'Sổ theo dõi tài sản cố định, công cụ dụng cụ.',
        'Sổ quỹ tiền mặt, sổ tiền gửi ngân hàng.',
      ]),
      heading('h2', 'Nguyên tắc ghi sổ'),
      paragraph(
        'Sổ sách phải được ghi chép kịp thời, đầy đủ, chính xác và có căn cứ từ chứng từ gốc hợp lệ. Doanh nghiệp có thể ghi sổ bằng tay hoặc bằng phần mềm kế toán, miễn đảm bảo tính liên tục và có thể đối chiếu được.',
      ),
      heading('h3', 'Thời hạn lưu trữ'),
      paragraph(
        'Sổ sách và chứng từ kế toán cần được lưu trữ trong thời hạn theo quy định, tuỳ loại tài liệu. [Dẫn văn bản — khách xác nhận số hiệu và thời hạn cụ thể]',
      ),
      heading('h2', 'Những sai sót thường gặp'),
      bulletList([
        'Ghi sổ chậm so với thời điểm phát sinh nghiệp vụ.',
        'Thiếu chứng từ gốc kèm theo bút toán.',
        'Không đối chiếu định kỳ giữa sổ chi tiết và sổ cái.',
      ]),
      sampleNotice(),
    ]),
  },
  {
    title: 'Mẫu 08A — Bảng kê khối lượng công việc hoàn thành',
    slug: 'mau-08a-bang-ke-khoi-luong-cong-viec-hoan-thanh',
    categorySlug: 'van-ban-phap-luat',
    publishedAt: '2025-01-09T09:00:00.000Z',
    excerpt: 'Hướng dẫn điền mẫu 08A và các lưu ý khi nộp.',
    content: richText([
      paragraph(
        'Mẫu 08A — Bảng kê khối lượng công việc hoàn thành thường được sử dụng để xác nhận khối lượng, giá trị công việc/hàng hoá đã thực hiện, làm căn cứ nghiệm thu, thanh toán hoặc lập chứng từ kế toán liên quan.',
      ),
      heading('h2', 'Các bước điền mẫu'),
      bulletList([
        'Ghi đầy đủ thông tin đơn vị, bộ phận và thời gian thực hiện công việc.',
        'Liệt kê chi tiết khối lượng công việc theo từng hạng mục.',
        'Đối chiếu số liệu với hợp đồng hoặc đơn đặt hàng liên quan.',
        'Ký xác nhận của các bên liên quan trước khi nộp hoặc lưu hồ sơ.',
      ]),
      heading('h2', 'Lưu ý khi sử dụng'),
      paragraph(
        'Bảng kê cần khớp với chứng từ gốc (hợp đồng, biên bản nghiệm thu, hoá đơn) để tránh sai lệch khi đối chiếu sổ sách. Nên lưu kèm bản mềm và bản giấy đã ký để thuận tiện tra cứu sau này.',
      ),
      paragraph('Mẫu biểu và hướng dẫn điền cụ thể theo quy định/hợp đồng áp dụng. [Dẫn văn bản — khách xác nhận số hiệu]'),
      sampleNotice(),
    ]),
  },
  {
    title: 'Phân biệt kế toán nội bộ và kế toán thuế',
    slug: 'phan-biet-ke-toan-noi-bo-va-ke-toan-thue',
    categorySlug: 'ke-toan-tai-chinh',
    publishedAt: '2025-05-20T09:00:00.000Z',
    excerpt: 'Hai hệ thống sổ sách phục vụ hai mục đích khác nhau — doanh nghiệp cần cả hai.',
    content: richText([
      paragraph(
        'Nhiều doanh nghiệp nhầm lẫn giữa kế toán nội bộ và kế toán thuế, dẫn tới việc chỉ duy trì một hệ thống sổ sách và gặp khó khi cần số liệu phục vụ điều hành thực tế. Bài viết này làm rõ sự khác biệt giữa hai hệ thống.',
      ),
      heading('h2', 'Kế toán thuế'),
      paragraph(
        'Là hệ thống sổ sách bắt buộc, tuân theo chuẩn mực kế toán và quy định thuế hiện hành, dùng để lập báo cáo tài chính và tờ khai nộp cơ quan quản lý nhà nước.',
      ),
      heading('h2', 'Kế toán nội bộ'),
      paragraph(
        'Là hệ thống theo dõi linh hoạt hơn, phản ánh dòng tiền và chi phí thực tế theo cách chủ doanh nghiệp cần để ra quyết định, không nhất thiết phải khớp hoàn toàn với sổ sách thuế.',
      ),
      heading('h3', 'Vì sao nên có cả hai'),
      bulletList([
        'Kế toán thuế đảm bảo tuân thủ quy định, tránh rủi ro pháp lý.',
        'Kế toán nội bộ giúp chủ doanh nghiệp nhìn đúng hiệu quả hoạt động thực tế.',
        'Có cả hai giúp việc soát xét, đối chiếu khi cần minh bạch hoá số liệu dễ dàng hơn.',
      ]),
      heading('h2', 'Kết'),
      paragraph(
        'Doanh nghiệp nên xây dựng song song hai hệ thống ngay từ đầu, thay vì chỉ dựa vào sổ sách thuế, để tránh bị động khi cần ra quyết định nhanh.',
      ),
      sampleNotice(),
    ]),
  },
  {
    title: 'Những nhầm lẫn thường gặp khi lập báo cáo tài chính',
    slug: 'nham-lan-thuong-gap-khi-lap-bao-cao-tai-chinh',
    categorySlug: 'ke-toan-tai-chinh',
    publishedAt: '2025-05-15T09:00:00.000Z',
    excerpt: 'Một số lỗi phổ biến khiến báo cáo tài chính phải sửa lại nhiều lần.',
    content: richText([
      paragraph(
        'Báo cáo tài chính là tài liệu quan trọng phản ánh tình hình hoạt động của doanh nghiệp trong năm. Một số nhầm lẫn lặp lại qua các kỳ khiến việc lập báo cáo mất nhiều thời gian hơn cần thiết.',
      ),
      heading('h2', 'Các nhầm lẫn phổ biến'),
      bulletList([
        'Không đối chiếu số dư đầu kỳ với báo cáo năm trước đã nộp.',
        'Ghi nhận doanh thu/chi phí sai kỳ kế toán.',
        'Thiếu thuyết minh cho các biến động lớn trong năm.',
        'Không đối chiếu số liệu công nợ với xác nhận của đối tác.',
      ]),
      heading('h2', 'Cách phòng tránh'),
      paragraph(
        'Thực hiện đối chiếu định kỳ hàng tháng hoặc hàng quý thay vì dồn vào cuối năm giúp phát hiện sớm sai lệch. Doanh nghiệp cũng nên rà soát lại các bút toán điều chỉnh cuối kỳ trước khi khoá sổ.',
      ),
      heading('h3', 'Khi nào nên nhờ soát xét độc lập'),
      paragraph(
        'Với doanh nghiệp có nhiều giao dịch phức tạp hoặc chuẩn bị cho đợt thanh tra, kiểm tra, việc soát xét độc lập trước khi nộp báo cáo giúp giảm rủi ro phải giải trình, điều chỉnh sau này.',
      ),
      sampleNotice(),
    ]),
  },
  {
    title: 'Chuẩn bị hồ sơ trước khi bàn giao cho đơn vị kế toán mới',
    slug: 'chuan-bi-ho-so-truoc-khi-ban-giao-don-vi-ke-toan-moi',
    categorySlug: 'doanh-nghiep',
    publishedAt: '2025-04-28T09:00:00.000Z',
    excerpt: 'Danh mục tài liệu doanh nghiệp nên chuẩn bị khi đổi đơn vị làm kế toán.',
    content: richText([
      paragraph(
        'Khi doanh nghiệp chuyển từ tự làm kế toán sang thuê ngoài, hoặc đổi đơn vị cung cấp dịch vụ, việc bàn giao hồ sơ đầy đủ giúp đơn vị mới tiếp nhận công việc nhanh và tránh gián đoạn kê khai.',
      ),
      heading('h2', 'Danh mục tài liệu cần bàn giao'),
      bulletList([
        'Sổ sách kế toán và báo cáo tài chính các năm gần nhất.',
        'Toàn bộ tờ khai thuế đã nộp trong năm hiện tại.',
        'Hợp đồng lao động, hồ sơ bảo hiểm xã hội của nhân sự đang làm việc.',
        'Chứng từ ngân hàng, hoá đơn đầu vào/đầu ra chưa hạch toán (nếu có).',
      ]),
      heading('h2', 'Quy trình bàn giao gợi ý'),
      bulletList([
        'Lập biên bản bàn giao ghi rõ danh mục và tình trạng tài liệu.',
        'Đối chiếu số dư các tài khoản chính giữa hai bên trước khi chốt bàn giao.',
        'Thống nhất thời điểm đơn vị mới chính thức tiếp nhận công việc.',
      ]),
      heading('h2', 'Kết'),
      paragraph(
        'Bàn giao rõ ràng ngay từ đầu giúp tránh tình trạng thiếu chứng từ khi quyết toán cuối năm, đồng thời giúp đơn vị kế toán mới nắm bắt tình hình doanh nghiệp nhanh hơn.',
      ),
      sampleNotice(),
    ]),
  },
  {
    title: 'Tổng quan các loại thuế doanh nghiệp thường gặp',
    slug: 'tong-quan-cac-loai-thue-doanh-nghiep-thuong-gap',
    categorySlug: 'cac-loai-thue',
    publishedAt: '2025-04-10T09:00:00.000Z',
    excerpt: 'Điểm qua các sắc thuế phổ biến mà doanh nghiệp cần theo dõi và kê khai.',
    content: richText([
      paragraph(
        'Tuỳ ngành nghề và mô hình hoạt động, doanh nghiệp có thể phải kê khai một hoặc nhiều loại thuế khác nhau. Bài viết tổng hợp các nhóm thuế phổ biến để doanh nghiệp hình dung tổng thể nghĩa vụ của mình.',
      ),
      heading('h2', 'Các nhóm thuế thường gặp'),
      bulletList([
        'Thuế giá trị gia tăng — áp dụng cho hàng hoá, dịch vụ tiêu thụ.',
        'Thuế thu nhập doanh nghiệp — tính trên kết quả kinh doanh trong kỳ.',
        'Thuế thu nhập cá nhân — khấu trừ từ thu nhập của người lao động.',
        'Các loại thuế, phí khác tuỳ ngành nghề đặc thù (nếu có).',
      ]),
      heading('h2', 'Vì sao cần theo dõi sát lịch kê khai'),
      paragraph(
        'Mỗi loại thuế có kỳ kê khai và thời hạn nộp riêng. Theo dõi sát lịch giúp doanh nghiệp tránh bị động và có đủ thời gian chuẩn bị hồ sơ, chứng từ liên quan.',
      ),
      paragraph('Mức thuế suất, ngưỡng áp dụng và thời hạn cụ thể theo quy định hiện hành. [Dẫn văn bản — khách xác nhận số hiệu]'),
      sampleNotice(),
    ]),
  },
  {
    title: 'Khi nào doanh nghiệp cần soát xét hồ sơ trước quyết toán',
    slug: 'khi-nao-doanh-nghiep-can-soat-xet-ho-so-truoc-quyet-toan',
    categorySlug: 'doanh-nghiep',
    publishedAt: '2025-03-22T09:00:00.000Z',
    excerpt: 'Một số dấu hiệu cho thấy doanh nghiệp nên rà soát hồ sơ trước khi quyết toán.',
    content: richText([
      paragraph(
        'Không phải doanh nghiệp nào cũng cần soát xét độc lập trước quyết toán, nhưng có một số dấu hiệu cho thấy việc rà soát trước sẽ giúp giảm rủi ro đáng kể.',
      ),
      heading('h2', 'Dấu hiệu nên soát xét'),
      bulletList([
        'Doanh nghiệp nhiều năm chưa bị thanh tra, kiểm tra thuế.',
        'Có nhiều giao dịch với bên liên quan hoặc giao dịch giá trị lớn bất thường.',
        'Từng thay đổi đơn vị kế toán hoặc phần mềm kế toán trong kỳ.',
        'Chuẩn bị huy động vốn, vay ngân hàng hoặc mời gọi đầu tư.',
      ]),
      heading('h2', 'Lợi ích của việc soát xét sớm'),
      paragraph(
        'Phát hiện sai sót trước khi cơ quan thuế vào cuộc giúp doanh nghiệp chủ động điều chỉnh, tránh bị truy thu và mất thời gian giải trình kéo dài.',
      ),
      sampleNotice(),
    ]),
  },
  {
    title: 'Hồ sơ bảo hiểm xã hội doanh nghiệp cần lưu giữ',
    slug: 'ho-so-bao-hiem-xa-hoi-doanh-nghiep-can-luu-giu',
    categorySlug: 'bao-hiem-xa-hoi',
    publishedAt: '2025-03-05T09:00:00.000Z',
    excerpt: 'Danh mục hồ sơ bảo hiểm xã hội cơ bản mà doanh nghiệp nên lưu trữ có hệ thống.',
    content: richText([
      paragraph(
        'Bên cạnh sổ sách kế toán, hồ sơ bảo hiểm xã hội của người lao động cũng là tài liệu doanh nghiệp cần lưu trữ có hệ thống, phục vụ đối chiếu khi có yêu cầu từ cơ quan bảo hiểm xã hội.',
      ),
      heading('h2', 'Nhóm hồ sơ cơ bản'),
      bulletList([
        'Hợp đồng lao động và các phụ lục sửa đổi (nếu có).',
        'Danh sách lao động tham gia bảo hiểm xã hội theo từng thời điểm.',
        'Chứng từ nộp bảo hiểm xã hội hàng tháng/quý.',
        'Hồ sơ tăng/giảm lao động khi có biến động nhân sự.',
      ]),
      heading('h2', 'Lưu ý khi lưu trữ'),
      paragraph(
        'Hồ sơ nên được cập nhật ngay khi có biến động nhân sự thay vì dồn lại xử lý sau, để tránh sai lệch giữa thực tế và số liệu đã đăng ký với cơ quan bảo hiểm xã hội.',
      ),
      paragraph('Thủ tục và mẫu biểu cụ thể theo quy định hiện hành. [Dẫn văn bản — khách xác nhận số hiệu]'),
      sampleNotice(),
    ]),
  },
] as const

/**
 * Ảnh stock mẫu (gói M1, đợt 6) — nguồn Unsplash, giấy phép ghi trong MEDIA-CREDITS.md.
 * `alt` PHẢI kết thúc bằng " [Ảnh mẫu]" để nhận ra trong admin — xem contract M1 §3.
 * `sourceFilename`: tên file trong thư mục nguồn dùng khi seed (ngoài repo, không commit —
 * xem ghi chú trong seed/index.ts). `filename`: tên bản ghi lưu trong bảng `media`, dùng để
 * seed idempotent (kiểm trùng theo filename trước khi tạo).
 */
export const POST_IMAGES: Record<string, { filename: string; alt: string }> = {
  'mau-ho-so-giai-the-doanh-nghiep': {
    filename: 'hiacc-stock-glasses-notebook.jpg',
    alt: 'Kính mắt đặt cạnh sổ tay và bút trên bàn làm việc [Ảnh mẫu]',
  },
  'so-sach-ke-toan': {
    filename: 'hiacc-stock-desk-lamp.jpg',
    alt: 'Đèn bàn làm việc màu xám đặt trên mặt bàn gỗ [Ảnh mẫu]',
  },
  'mau-08a-bang-ke-khoi-luong-cong-viec-hoan-thanh': {
    filename: 'hiacc-stock-keyboard-coffee.jpg',
    alt: 'Bàn phím, tách cà phê và các vật dụng văn phòng nhìn từ trên xuống [Ảnh mẫu]',
  },
  'phan-biet-ke-toan-noi-bo-va-ke-toan-thue': {
    filename: 'hiacc-stock-clock-plant.jpg',
    alt: 'Đồng hồ treo tường cạnh chậu cây nhỏ trong văn phòng [Ảnh mẫu]',
  },
  'nham-lan-thuong-gap-khi-lap-bao-cao-tai-chinh': {
    filename: 'hiacc-stock-finance-chart.jpg',
    alt: 'Biểu đồ tài chính in trên giấy đặt trên bàn làm việc [Ảnh mẫu]',
  },
  'chuan-bi-ho-so-truoc-khi-ban-giao-don-vi-ke-toan-moi': {
    filename: 'hiacc-stock-office-cubicles.jpg',
    alt: 'Dãy bàn làm việc kiểu cubicle trống trong văn phòng [Ảnh mẫu]',
  },
  'tong-quan-cac-loai-thue-doanh-nghiep-thuong-gap': {
    filename: 'hiacc-stock-imac-desk.jpg',
    alt: 'Máy tính để bàn và tài liệu trên bàn làm việc cạnh cửa sổ [Ảnh mẫu]',
  },
  'khi-nao-doanh-nghiep-can-soat-xet-ho-so-truoc-quyet-toan': {
    filename: 'hiacc-stock-office-hallway.jpg',
    alt: 'Hành lang văn phòng với vách kính và đèn trần [Ảnh mẫu]',
  },
  'ho-so-bao-hiem-xa-hoi-doanh-nghiep-can-luu-giu': {
    filename: 'hiacc-stock-laptop-desk.jpg',
    alt: 'Laptop và chuột đặt trên bàn làm việc gỗ tối màu [Ảnh mẫu]',
  },
} as const

/** Ảnh hero cho trang "Giới thiệu" — bàn làm việc gần cửa sổ, không có mặt người. */
/**
 * Ảnh minh hoạ cho 7 dịch vụ. Cùng quy tắc với POST_IMAGES: ảnh mẫu Unsplash,
 * `alt` kết thúc bằng " [Ảnh mẫu]" để nhận ra ngay trong admin.
 */
export const SERVICE_IMAGES: Record<string, { filename: string; alt: string }> = {
  'ke-toan-tron-goi': {
    filename: 'hiacc-stock-svc-ledger.jpg',
    alt: 'Sổ sách kế toán và bút trên bàn làm việc [Ảnh mẫu]',
  },
  'ke-toan-noi-bo': {
    filename: 'hiacc-stock-svc-folders.jpg',
    alt: 'Các cặp hồ sơ tài liệu xếp trên kệ [Ảnh mẫu]',
  },
  'soat-xet-ho-so': {
    filename: 'hiacc-stock-svc-magnifier.jpg',
    alt: 'Kính lúp đặt trên trang tài liệu [Ảnh mẫu]',
  },
  'quyet-toan-thue': {
    filename: 'hiacc-stock-svc-calculator.jpg',
    alt: 'Máy tính cầm tay và bảng số liệu kế toán [Ảnh mẫu]',
  },
  'hoan-thue-gtgt': {
    filename: 'hiacc-stock-svc-coins.jpg',
    alt: 'Đồng xu xếp chồng cạnh sổ ghi chép [Ảnh mẫu]',
  },
  'quyet-toan-giai-the': {
    filename: 'hiacc-stock-svc-archive.jpg',
    alt: 'Kho lưu trữ hồ sơ doanh nghiệp [Ảnh mẫu]',
  },
  'bao-cao-tai-chinh': {
    filename: 'hiacc-stock-svc-report.jpg',
    alt: 'Báo cáo tài chính in ra kèm biểu đồ [Ảnh mẫu]',
  },
}

export const PAGE_IMAGES: Record<string, { filename: string; alt: string }> = {
  'gioi-thieu': {
    filename: 'hiacc-stock-desk-window.jpg',
    alt: 'Bàn làm việc đặt cạnh cửa sổ lớn với cây xanh trong văn phòng [Ảnh mẫu]',
  },
}

/** Ảnh hero mặc định — ẢNH MẪU (Unsplash), khách sẽ thay bằng ảnh thật trong /admin. */
export const SETTINGS_HERO_IMAGE = {
  filename: 'hiacc-stock-desk-window.jpg',
  alt: 'Góc làm việc bên cửa sổ văn phòng, có laptop và cây xanh [Ảnh mẫu]',
}

export const SETTINGS = {
  siteName: 'Kế toán HiACC',
  tagline: 'Đồng hành cùng doanh nghiệp Việt',
  primaryColor: '#CC1420',
  companyName: 'Công ty TNHH HiACC',
  taxCode: '0110387991',
  /**
   * Liên hệ: SĐT và email lấy từ chính tài liệu khách gửi (SET WEB.xlsx, sheet
   * PAGE) nên là số THẬT. Địa chỉ trụ sở là mẫu — khách chưa cấp, và ảnh thiết
   * kế cũng ghi "Số nhà — đường — phường — quận — thành phố".
   */
  headOfficeAddress: 'Tầng 14, toà nhà Việt Á, phường Cầu Giấy, thành phố Hà Nội',
  hotline: '0948 861 209',
  hotline2: '0965 963 813',
  email: 'hiacc.kt01@gmail.com',
  workingHours: '08:00 – 17:30, thứ Hai – thứ Sáu',
  /**
   * Nguyên tắc hành nghề: nội dung MẪU cho trang Giới thiệu. Ba mục này mô tả
   * cách làm việc, không phải tuyên bố năng lực kiểm chứng được (chứng chỉ, giải
   * thưởng, số khách hàng) — loại đó phải do khách cấp và chịu trách nhiệm.
   */
  principles: [
    {
      title: 'Tuân thủ trước tối ưu',
      description:
        'Mọi phương án đều được đặt trong khuôn khổ pháp luật hiện hành; phần tối ưu chi phí chỉ xét sau khi điều kiện tuân thủ được bảo đảm.',
    },
    {
      title: 'Một đầu mối phụ trách',
      description:
        'Mỗi khách hàng có một chuyên viên phụ trách xuyên suốt hồ sơ, chịu trách nhiệm về tiến độ và nội dung bàn giao.',
    },
    {
      title: 'Phí báo trước, không phát sinh',
      description:
        'Biểu phí và lệ phí nhà nước được thông báo bằng văn bản trước khi thực hiện thủ tục.',
    },
  ],
  // KHÔNG khẳng định năng lực chưa được khách xác nhận ("đội ngũ 100% có chứng
  // chỉ hành nghề" là tuyên bố kiểm chứng được, khách phải tự chịu trách nhiệm).
  aboutShort:
    'HiACC cung cấp dịch vụ kế toán, thuế và thủ tục pháp lý doanh nghiệp, với một chuyên viên phụ trách xuyên suốt từng hồ sơ.',
  copyright: '© 2026 Công ty TNHH HiACC. Bảo lưu mọi quyền.',
} as const
