/**
 * Nội dung MẪU cho các hạng mục dịch vụ.
 *
 * Vì sao chỉ làm đầy 2 hạng mục: khách chưa gửi nội dung thật (Excel ghi 2 lần
 * "Thông tin chi tiết e sẽ up vào sau ạ"). Hai hạng mục này dựng đủ để chứng
 * minh khối lắp ghép chịu được CẢ HAI cực cấu trúc trong tài liệu khách:
 *   - Kế toán trọn gói : bảng giá + 3 danh sách (nhóm lệch chuẩn nhất)
 *   - Thay đổi tên     : bảng 5 trường chuẩn hoá (nhóm quy củ nhất)
 * 30 hạng mục còn lại giữ tiêu đề thật + một dòng báo đang cập nhật.
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
            value: `${SAMPLE_TAG} Liên hệ để nhận báo phí theo hồ sơ cụ thể.`,
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
