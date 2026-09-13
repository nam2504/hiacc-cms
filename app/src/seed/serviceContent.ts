/**
 * Nội dung MẪU cho các hạng mục dịch vụ.
 *
 * Ban đầu chỉ 2 hạng mục (Kế toán trọn gói, Thay đổi tên) — khách chưa gửi nội
 * dung thật lúc đó. Bổ sung 13/09: khách duyệt biểu phí mẫu do bên thiết kế
 * soạn trong `hitax/hiacc-website-demo.html` (biến `PRICES`/`CATS`, tự ghi chú
 * "chờ HIACC xác nhận trước khi công bố" — nay đã được xác nhận), nên seed
 * thêm bảng giá cho 4 nhóm còn lại (Thành lập, Thay đổi ĐKKD, Giấy phép hoạt
 * động, Dịch vụ khác). Mỗi hạng mục con seed đúng 1 dòng giá của chính nó —
 * cây dịch vụ thật đã tách theo hạng mục, khác bảng gộp-theo-nhóm của file demo.
 *
 * ⚠️ Số trong bảng giá "Kế toán trọn gói" lấy đúng từ ảnh mockup khách gửi
 * (`hitax/extracted/Chi tiết dịch vụ.png`), KHÔNG phải tôi bịa. Mọi con số
 * không có trong tài liệu khách thì để trống, không đoán — dự án này đã một lần
 * phải đi gỡ số bịa khỏi trang chủ (WS-6 task C2).
 */

type PricingRow = { item: string; scope?: string; fee?: string }
type FieldRow = { label: string; value: string }

export type ServiceContentSeed = {
  slug: string
  summary?: string
  heroStats?: { value: string; label: string }[]
  blocks: (
    | { type: 'pricingTable'; title?: string; rows: PricingRow[]; note?: string }
    | { type: 'bulletList'; title: string; items: string[] }
    | { type: 'fieldTable'; title?: string; rows: FieldRow[] }
  )[]
}

/** Nhãn dán vào mọi nội dung mẫu để không ai nhầm là bản chính thức. */
export const SAMPLE_TAG = '[Nội dung mẫu — chờ nội dung chính thức của khách.]'

export const SERVICE_CONTENT: ServiceContentSeed[] = [
  {
    slug: 'ke-toan-tron-goi',
    summary:
      'Yêu cầu chung, hồ sơ cần cung cấp, trình tự thực hiện, thời gian và phí dịch vụ cho hạng mục kế toán trọn gói.',
    blocks: [
      {
        type: 'pricingTable',
        title: 'Bảng giá dịch vụ',
        rows: [
          {
            item: 'Không phát sinh hoá đơn',
            scope: 'Tờ khai thuế, báo cáo quý, BCTC năm',
            fee: '500.000 / tháng',
          },
          {
            item: 'Dưới 20 chứng từ',
            scope: 'Sổ sách, thuế, lương, BCTC năm',
            fee: '1.200.000 / tháng',
          },
          {
            item: '20 – 50 chứng từ',
            scope: 'Sổ sách, thuế, lương, kho, BCTC năm',
            fee: '2.000.000 / tháng',
          },
          {
            item: 'Trên 50 chứng từ',
            scope: 'Trọn gói theo khối lượng thực tế',
            fee: 'từ 3.000.000 / tháng',
          },
        ],
        note: `${SAMPLE_TAG} Biểu phí chưa gồm lệ phí nhà nước.`,
      },
      {
        type: 'bulletList',
        title: 'Nhiệm vụ của công ty',
        items: [
          'Tiếp nhận thông tin, rà soát điều kiện pháp lý và tư vấn phương án thực hiện.',
          'Soạn thảo trọn bộ hồ sơ theo mẫu và quy định đang có hiệu lực.',
          'Đại diện khách hàng nộp hồ sơ, theo dõi tiến độ và bổ sung khi cơ quan quản lý yêu cầu.',
          'Nhận kết quả, bàn giao bản gốc và bản lưu cho khách hàng.',
          'Hướng dẫn các nghĩa vụ phải thực hiện sau khi hoàn tất thủ tục.',
        ],
      },
      {
        type: 'bulletList',
        title: 'Nhiệm vụ của khách hàng',
        items: [
          'Cung cấp bản sao giấy tờ pháp lý của công ty và của người đại diện.',
          'Cung cấp thông tin trung thực, đầy đủ về nội dung cần thực hiện.',
          'Ký hồ sơ theo hướng dẫn của chuyên viên phụ trách.',
          'Thanh toán phí dịch vụ và lệ phí nhà nước theo thoả thuận.',
        ],
      },
      {
        type: 'bulletList',
        title: 'Cam kết',
        items: [
          'Hồ sơ được soạn đúng quy định pháp luật hiện hành.',
          'Thực hiện đúng thời gian đã thông báo khi tiếp nhận hồ sơ.',
          'Phí trọn gói, không phát sinh ngoài nội dung đã báo trước.',
          'Bảo mật toàn bộ thông tin và dữ liệu của khách hàng.',
        ],
      },
    ],
  },
  {
    slug: 'thay-doi-ten',
    summary:
      'Yêu cầu chung, hồ sơ cần cung cấp, trình tự thực hiện, thời gian và phí dịch vụ cho hạng mục thay đổi tên.',
    blocks: [
      {
        type: 'fieldTable',
        rows: [
          {
            label: 'Yêu cầu chung',
            value:
              'Doanh nghiệp đang hoạt động, không thuộc trường hợp bị khoá mã số thuế. Tên mới không trùng hoặc gây nhầm lẫn với tên đã đăng ký.',
          },
          {
            label: 'Thực hiện',
            value:
              'Tiếp nhận thông tin và rà soát điều kiện — trong ngày làm việc.\nSoạn hồ sơ, gửi khách hàng kiểm tra và ký.\nNộp hồ sơ tới cơ quan có thẩm quyền và theo dõi tiến độ.\nNhận kết quả, bàn giao và hướng dẫn nghĩa vụ tiếp theo.',
          },
          {
            label: 'Thời gian',
            value:
              '03 ngày kể từ khi nhận đủ hồ sơ hợp lệ. Thời gian trên chưa tính thời gian bổ sung hồ sơ theo yêu cầu của cơ quan quản lý.',
          },
          {
            label: 'Trả kết quả',
            value:
              'Bản gốc giấy chứng nhận hoặc văn bản chấp thuận của cơ quan có thẩm quyền.\nBộ hồ sơ đã nộp, có dấu tiếp nhận.\nBàn giao tại trụ sở khách hàng hoặc chuyển phát theo yêu cầu.',
          },
          {
            label: 'Phí dịch vụ',
            value: `${SAMPLE_TAG} 800.000.`,
          },
        ],
      },
      {
        type: 'bulletList',
        title: 'Cam kết',
        items: [
          'Hồ sơ được soạn đúng quy định pháp luật hiện hành.',
          'Thực hiện đúng thời gian đã thông báo khi tiếp nhận hồ sơ.',
          'Phí báo trước, không phát sinh ngoài nội dung đã thoả thuận.',
          'Bảo mật toàn bộ thông tin và dữ liệu của khách hàng.',
        ],
      },
    ],
  },
  // --- Thành lập (PRICES.thanhlap, hitax/hiacc-website-demo.html) ---
  {
    slug: 'thanh-lap-cong-ty',
    blocks: [
      {
        type: 'pricingTable',
        rows: [
          { item: 'Công ty trong nước', scope: 'Soạn hồ sơ, nộp, nhận GCN ĐKDN, khắc dấu', fee: '1.200.000' },
        ],
        note: SAMPLE_TAG,
      },
    ],
  },
  {
    slug: 'thanh-lap-chi-nhanh-dia-diem-kinh-doanh',
    blocks: [
      {
        type: 'pricingTable',
        rows: [
          { item: 'Chi nhánh, địa điểm kinh doanh', scope: 'Soạn hồ sơ, nộp, nhận kết quả', fee: '1.000.000' },
        ],
        note: SAMPLE_TAG,
      },
    ],
  },
  {
    slug: 'thanh-lap-van-phong-dai-dien',
    blocks: [
      {
        type: 'pricingTable',
        rows: [{ item: 'Văn phòng đại diện', scope: 'Soạn hồ sơ, nộp, nhận kết quả', fee: '1.000.000' }],
        note: SAMPLE_TAG,
      },
    ],
  },
  {
    slug: 'thanh-lap-ho-kinh-doanh',
    blocks: [
      {
        type: 'pricingTable',
        rows: [{ item: 'Hộ kinh doanh', scope: 'Hồ sơ, nộp UBND cấp huyện', fee: '800.000' }],
        note: SAMPLE_TAG,
      },
    ],
  },
  {
    slug: 'thanh-lap-cong-ty-von-nuoc-ngoai',
    blocks: [
      {
        type: 'pricingTable',
        rows: [{ item: 'Công ty có vốn nước ngoài', scope: 'Tư vấn ngành nghề, IRC và ERC', fee: 'từ 12.000.000' }],
        note: SAMPLE_TAG,
      },
    ],
  },
  // --- Thay đổi ĐKKD (CATS.thaydoi.items, cùng nguồn) ---
  {
    slug: 'thay-doi-dia-chi',
    blocks: [
      { type: 'pricingTable', rows: [{ item: 'Thay đổi địa chỉ', fee: '800.000' }], note: SAMPLE_TAG },
    ],
  },
  {
    slug: 'bo-sung-nganh-nghe',
    blocks: [
      { type: 'pricingTable', rows: [{ item: 'Bổ sung ngành nghề', fee: '800.000' }], note: SAMPLE_TAG },
    ],
  },
  {
    slug: 'tang-giam-von-dieu-le',
    blocks: [
      { type: 'pricingTable', rows: [{ item: 'Tăng, giảm vốn điều lệ', fee: '1.000.000' }], note: SAMPLE_TAG },
    ],
  },
  {
    slug: 'thay-doi-co-dong',
    blocks: [{ type: 'pricingTable', rows: [{ item: 'Thay đổi cổ đông', fee: '1.000.000' }], note: SAMPLE_TAG }],
  },
  {
    slug: 'thay-doi-dai-dien-phap-luat',
    blocks: [
      { type: 'pricingTable', rows: [{ item: 'Thay đổi đại diện pháp luật', fee: '1.000.000' }], note: SAMPLE_TAG },
    ],
  },
  {
    slug: 'thay-doi-loai-hinh-cong-ty',
    blocks: [
      { type: 'pricingTable', rows: [{ item: 'Thay đổi loại hình công ty', fee: '1.500.000' }], note: SAMPLE_TAG },
    ],
  },
  {
    slug: 'cap-nhat-thong-tin-cong-ty',
    blocks: [
      { type: 'pricingTable', rows: [{ item: 'Cập nhật thông tin công ty', fee: '600.000' }], note: SAMPLE_TAG },
    ],
  },
  {
    slug: 'tam-ngung-hoat-dong',
    blocks: [{ type: 'pricingTable', rows: [{ item: 'Tạm ngừng hoạt động', fee: '700.000' }], note: SAMPLE_TAG }],
  },
  // --- Giấy phép hoạt động (PRICES.giayphep, cùng nguồn) ---
  {
    slug: 'gp-du-lich-lu-hanh',
    blocks: [
      {
        type: 'pricingTable',
        rows: [{ item: 'GP du lịch lữ hành', scope: 'Điều kiện, ký quỹ, hồ sơ, nộp Sở Du lịch', fee: 'từ 6.000.000' }],
        note: SAMPLE_TAG,
      },
    ],
  },
  {
    slug: 'gp-kinh-doanh-ruou',
    blocks: [
      {
        type: 'pricingTable',
        rows: [
          {
            item: 'GP kinh doanh rượu',
            scope: 'Hồ sơ, nộp Phòng Kinh tế / Sở Công Thương',
            fee: 'từ 5.000.000',
          },
        ],
        note: SAMPLE_TAG,
      },
    ],
  },
  {
    slug: 'gp-ve-sinh-an-toan-thuc-pham',
    blocks: [
      {
        type: 'pricingTable',
        rows: [
          {
            item: 'GP vệ sinh an toàn thực phẩm',
            scope: 'Hồ sơ, tập huấn, thẩm định cơ sở',
            fee: 'từ 5.000.000',
          },
        ],
        note: SAMPLE_TAG,
      },
    ],
  },
  {
    slug: 'gp-kinh-doanh-van-tai',
    blocks: [
      {
        type: 'pricingTable',
        rows: [
          { item: 'GP kinh doanh vận tải', scope: 'Phương án kinh doanh, hồ sơ, nộp Sở GTVT', fee: 'từ 4.000.000' },
        ],
        note: SAMPLE_TAG,
      },
    ],
  },
  {
    slug: 'gp-cho-thue-lai-lao-dong',
    blocks: [
      {
        type: 'pricingTable',
        rows: [
          {
            item: 'GP cho thuê lại lao động',
            scope: 'Ký quỹ, hồ sơ, nộp Sở LĐ-TB&XH',
            fee: 'từ 15.000.000',
          },
        ],
        note: SAMPLE_TAG,
      },
    ],
  },
  // --- Dịch vụ khác (PRICES.dvkhac, cùng nguồn) ---
  {
    slug: 'xin-visa',
    blocks: [
      {
        type: 'pricingTable',
        rows: [
          { item: 'Xin visa, gia hạn tạm trú', scope: 'Hồ sơ, nộp Cục Quản lý xuất nhập cảnh', fee: 'từ 3.000.000' },
        ],
        note: SAMPLE_TAG,
      },
    ],
  },
  {
    slug: 'xin-cap-giay-phep-lao-dong',
    blocks: [
      {
        type: 'pricingTable',
        rows: [
          { item: 'Giấy phép lao động', scope: 'Chấp thuận nhu cầu và cấp GPLĐ', fee: 'từ 6.000.000' },
        ],
        note: SAMPLE_TAG,
      },
    ],
  },
  {
    slug: 'dang-ky-nhan-hieu',
    blocks: [
      {
        type: 'pricingTable',
        rows: [
          { item: 'Đăng ký nhãn hiệu', scope: 'Tra cứu, phân nhóm, nộp đơn Cục SHTT', fee: 'từ 2.500.000' },
        ],
        note: SAMPLE_TAG,
      },
    ],
  },
  {
    slug: 'bao-hiem-xa-hoi',
    blocks: [
      {
        type: 'pricingTable',
        rows: [
          {
            item: 'BHXH — đăng ký ban đầu',
            scope: 'Đăng ký đơn vị, hồ sơ tham gia cho lao động',
            fee: '800.000',
          },
        ],
        note: SAMPLE_TAG,
      },
    ],
  },
  {
    slug: 'dau-bien',
    blocks: [
      {
        type: 'pricingTable',
        rows: [{ item: 'Dấu, biển', scope: 'Khắc dấu, làm biển hiệu', fee: 'từ 500.000' }],
        note: SAMPLE_TAG,
      },
    ],
  },
  {
    slug: 'chu-ky-so',
    blocks: [
      {
        type: 'pricingTable',
        rows: [{ item: 'Chữ ký số (CKS)', scope: 'Đăng ký chữ ký số', fee: 'từ 500.000' }],
        note: SAMPLE_TAG,
      },
    ],
  },
]

/**
 * Dải số liệu đầu trang cho 5 nhóm — số hạng mục đếm từ cây, còn "ngày làm việc"
 * và kiểu phí lấy từ mockup khách. Không có nhóm nào khách ghi số khác nên dùng
 * chung; khách sửa lại trong /admin nếu cần.
 */
export const GROUP_HERO_STATS: Record<string, { value: string; label: string }[]> = {
  'ke-toan': [
    { value: '7', label: 'Hạng mục' },
    { value: '03–05', label: 'Ngày làm việc' },
    { value: 'Trọn gói', label: 'Phí báo trước' },
  ],
  'thanh-lap': [
    { value: '5', label: 'Hạng mục' },
    { value: '03–05', label: 'Ngày làm việc' },
    { value: 'Trọn gói', label: 'Phí báo trước' },
  ],
  'thay-doi-dkkd': [
    { value: '9', label: 'Hạng mục' },
    { value: '03–05', label: 'Ngày làm việc' },
    { value: 'Trọn gói', label: 'Phí báo trước' },
  ],
  'giay-phep-hoat-dong': [
    { value: '5', label: 'Hạng mục' },
    { value: '03–05', label: 'Ngày làm việc' },
    { value: 'Trọn gói', label: 'Phí báo trước' },
  ],
  'dich-vu-khac': [
    { value: '6', label: 'Hạng mục' },
    { value: '03–05', label: 'Ngày làm việc' },
    { value: 'Trọn gói', label: 'Phí báo trước' },
  ],
}
