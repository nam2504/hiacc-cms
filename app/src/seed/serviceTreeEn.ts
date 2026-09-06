import type { Payload } from 'payload'

/**
 * Bản tiếng Anh cho cây dịch vụ.
 *
 * Phạm vi: TÊN của 5 nhóm và 32 hạng mục, cộng nội dung chi tiết của hai hạng
 * mục demo. Thân bài 30 hạng mục còn lại để trống — Payload tự rơi về tiếng Việt
 * (`fallback: true`), nên trang vẫn đọc được thay vì trắng.
 *
 * Vì sao chỉ hai hạng mục có nội dung đầy đủ: nội dung thật do khách viết, chưa
 * gửi. Hai hạng mục này đủ chứng minh khối lắp ghép chạy được ở cả hai ngôn ngữ.
 *
 * Thuật ngữ theo chuẩn quốc tế cho kế toán - thuế Việt Nam: VAT refund, tax
 * finalisation, business registration, conditional business licences. Chính tả
 * Anh-Anh cho nhất quán với từ điển giao diện.
 */

type NodeEn = { slug: string; title: string; summary?: string }

const GROUPS: NodeEn[] = [
  {
    slug: 'ke-toan',
    title: 'Accounting',
    summary:
      'Full-service accounting, in-house accounting, records review, tax finalisation and financial statements.',
  },
  {
    slug: 'thanh-lap',
    title: 'Company formation',
    summary:
      'Setting up companies, branches, representative offices, household businesses and foreign-invested entities.',
  },
  {
    slug: 'thay-doi-dkkd',
    title: 'Registration changes',
    summary:
      'Amending business registration details: name, address, business lines, charter capital, shareholders and legal form.',
  },
  {
    slug: 'giay-phep-hoat-dong',
    title: 'Operating licences',
    summary: 'Obtaining licences for conditional business lines.',
  },
  {
    slug: 'dich-vu-khac',
    title: 'Other services',
    summary:
      'Visas, work permits, trademarks, social insurance, company seals and digital signatures.',
  },
]

const PENDING_EN = 'Detailed content is being updated.'

const ITEMS: NodeEn[] = [
  // Accounting
  { slug: 'ke-toan-tron-goi', title: 'Full-service accounting' },
  { slug: 'ke-toan-noi-bo', title: 'In-house accounting' },
  { slug: 'kiem-tra-soat-xet-ho-so-ke-toan', title: 'Accounting records review' },
  { slug: 'quyet-toan-thue', title: 'Tax finalisation' },
  { slug: 'hoan-thue-gtgt', title: 'VAT refund' },
  { slug: 'quyet-toan-giai-the', title: 'Dissolution tax finalisation' },
  { slug: 'bao-cao-tai-chinh', title: 'Financial statements' },
  // Company formation
  { slug: 'thanh-lap-cong-ty', title: 'Company incorporation' },
  { slug: 'thanh-lap-chi-nhanh-dia-diem-kinh-doanh', title: 'Branch and business location' },
  { slug: 'thanh-lap-van-phong-dai-dien', title: 'Representative office' },
  { slug: 'thanh-lap-ho-kinh-doanh', title: 'Household business' },
  { slug: 'thanh-lap-cong-ty-von-nuoc-ngoai', title: 'Foreign-invested company' },
  // Registration changes
  { slug: 'thay-doi-ten', title: 'Change of company name' },
  { slug: 'thay-doi-dia-chi', title: 'Change of address' },
  { slug: 'bo-sung-nganh-nghe', title: 'Adding business lines' },
  { slug: 'tang-giam-von-dieu-le', title: 'Increase or decrease of charter capital' },
  { slug: 'thay-doi-co-dong', title: 'Change of shareholders' },
  { slug: 'thay-doi-dai-dien-phap-luat', title: 'Change of legal representative' },
  { slug: 'thay-doi-loai-hinh-cong-ty', title: 'Change of legal form' },
  { slug: 'cap-nhat-thong-tin-cong-ty', title: 'Updating company information' },
  { slug: 'tam-ngung-hoat-dong', title: 'Business suspension' },
  // Operating licences
  { slug: 'gp-du-lich-lu-hanh', title: 'Travel and tour operator licence' },
  { slug: 'gp-kinh-doanh-ruou', title: 'Alcohol trading licence' },
  { slug: 'gp-ve-sinh-an-toan-thuc-pham', title: 'Food safety licence' },
  { slug: 'gp-kinh-doanh-van-tai', title: 'Transport business licence' },
  { slug: 'gp-cho-thue-lai-lao-dong', title: 'Labour outsourcing licence' },
  // Other services
  { slug: 'xin-visa', title: 'Visa applications' },
  { slug: 'xin-cap-giay-phep-lao-dong', title: 'Work permits' },
  { slug: 'dang-ky-nhan-hieu', title: 'Trademark registration' },
  { slug: 'bao-hiem-xa-hoi', title: 'Social insurance' },
  { slug: 'dau-bien', title: 'Company seals and signage' },
  { slug: 'chu-ky-so', title: 'Digital signatures' },
]

/** Hai hạng mục demo có nội dung đầy đủ — cùng cặp với bản tiếng Việt. */
const DEMO_BODIES: Record<string, unknown[]> = {
  'ke-toan-tron-goi': [
    {
      blockType: 'pricingTable',
      title: 'Service fees',
      note: '[Sample content — pending the final version from the client.] Fees exclude state charges.',
      rows: [
        {
          item: 'No invoices issued',
          scope: 'Tax returns, quarterly reports, annual financial statements',
          fee: 'VND 500,000 / month',
        },
        {
          item: 'Under 20 documents',
          scope: 'Books, tax, payroll, annual financial statements',
          fee: 'VND 1,200,000 / month',
        },
        {
          item: '20 – 50 documents',
          scope: 'Books, tax, payroll, inventory, annual financial statements',
          fee: 'VND 2,000,000 / month',
        },
        {
          item: 'Over 50 documents',
          scope: 'Full service based on actual volume',
          fee: 'from VND 3,000,000 / month',
        },
      ],
    },
    {
      blockType: 'bulletList',
      title: 'Our responsibilities',
      items: [
        { text: 'Receive information, review legal conditions and advise on the approach.' },
        { text: 'Prepare the complete file to the templates and rules currently in force.' },
        {
          text: 'File on the client’s behalf, track progress and respond to requests from the authorities.',
        },
        { text: 'Collect the outcome and hand over originals together with a file copy.' },
        { text: 'Explain the obligations that follow once the procedure is complete.' },
      ],
    },
    {
      blockType: 'bulletList',
      title: 'Client responsibilities',
      items: [
        { text: 'Provide copies of the company’s and legal representative’s documents.' },
        { text: 'Provide accurate and complete information about the work required.' },
        { text: 'Sign the file as instructed by the assigned specialist.' },
        { text: 'Pay the service fee and state charges as agreed.' },
      ],
    },
    {
      blockType: 'bulletList',
      title: 'Our commitments',
      items: [
        { text: 'Files are prepared in line with the law currently in force.' },
        { text: 'Work is completed within the timeframe advised on receipt of the file.' },
        { text: 'Fixed fee, with nothing charged beyond what was quoted in advance.' },
        { text: 'All client information and data are kept confidential.' },
      ],
    },
  ],
  'thay-doi-ten': [
    {
      blockType: 'fieldTable',
      rows: [
        {
          label: 'General requirements',
          value:
            'The company is active and its tax code is not suspended. The new name must not duplicate or be confusingly similar to a registered name.',
        },
        {
          label: 'Process',
          value:
            'Receive information and review conditions — within the working day.\nPrepare the file, send it to the client for review and signature.\nFile with the competent authority and track progress.\nCollect the outcome, hand it over and explain the next obligations.',
        },
        {
          label: 'Timeframe',
          value:
            '03 days from receipt of a complete and valid file. This excludes time spent supplementing the file at the authority’s request.',
        },
        {
          label: 'Deliverables',
          value:
            'The original certificate or written approval from the competent authority.\nThe filed documents bearing the receipt stamp.\nHanded over at the client’s office or sent by courier on request.',
        },
        {
          label: 'Service fee',
          value:
            '[Sample content — pending the final version from the client.] Contact us for a quote based on your specific case.',
        },
      ],
    },
    {
      blockType: 'bulletList',
      title: 'Our commitments',
      items: [
        { text: 'Files are prepared in line with the law currently in force.' },
        { text: 'Work is completed within the timeframe advised on receipt of the file.' },
        { text: 'Fees are quoted in advance, with nothing charged beyond what was agreed.' },
        { text: 'All client information and data are kept confidential.' },
      ],
    },
  ],
}

/** Dải số liệu đầu trang, bản tiếng Anh. */
const HERO_STATS_EN: Record<string, { value: string; label: string }[]> = {
  'ke-toan': [
    { value: '7', label: 'Services' },
    { value: '03–05', label: 'Working days' },
    { value: 'Fixed fee', label: 'Quoted upfront' },
  ],
  'thanh-lap': [
    { value: '5', label: 'Services' },
    { value: '03–05', label: 'Working days' },
    { value: 'Fixed fee', label: 'Quoted upfront' },
  ],
  'thay-doi-dkkd': [
    { value: '9', label: 'Services' },
    { value: '03–05', label: 'Working days' },
    { value: 'Fixed fee', label: 'Quoted upfront' },
  ],
  'giay-phep-hoat-dong': [
    { value: '5', label: 'Services' },
    { value: '03–05', label: 'Working days' },
    { value: 'Fixed fee', label: 'Quoted upfront' },
  ],
  'dich-vu-khac': [
    { value: '6', label: 'Services' },
    { value: '03–05', label: 'Working days' },
    { value: 'Fixed fee', label: 'Quoted upfront' },
  ],
}

export async function seedServiceTreeEn(payload: Payload): Promise<void> {
  let filled = 0

  for (const node of [...GROUPS, ...ITEMS]) {
    const found = await payload.find({
      collection: 'service-nodes',
      where: { slug: { equals: node.slug } },
      limit: 1,
      depth: 0,
      locale: 'en',
    })
    const doc = found.docs[0]
    if (!doc) continue

    /**
     * Payload trả bản tiếng Việt khi tiếng Anh còn trống (fallback), nên không
     * phân biệt được "chưa dịch" với "đã dịch". Quy ước: nếu giá trị đang trả về
     * TRÙNG bản tiếng Việt thì coi là chưa dịch và ghi đè; khác đi thì có người
     * đã sửa trong /admin — giữ nguyên.
     */
    const viDoc = (
      await payload.find({
        collection: 'service-nodes',
        where: { slug: { equals: node.slug } },
        limit: 1,
        depth: 0,
        locale: 'vi',
      })
    ).docs[0]

    const data: Record<string, unknown> = {}
    const untranslated = !doc.title?.trim() || doc.title === viDoc?.title
    if (untranslated) data.title = node.title

    if (untranslated) {
      data.summary = node.summary ?? PENDING_EN
    }

    const body = DEMO_BODIES[node.slug]
    if (body) data.body = body

    const stats = HERO_STATS_EN[node.slug]
    if (stats) data.heroStats = stats

    await payload.update({
      collection: 'service-nodes',
      id: doc.id,
      locale: 'en',
      data,
    })
    filled += 1
  }

  console.log(`[seed] bản tiếng Anh cây dịch vụ: ghi ${filled} mục.`)
}
