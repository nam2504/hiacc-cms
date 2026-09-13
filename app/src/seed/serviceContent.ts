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
 * Bổ sung lần 2 (cùng ngày): `CATS` trong file demo còn liệt kê tên các
 * SECTION nội dung cho từng hạng mục (ví dụ "Nhiệm vụ của HIACC", "Cam kết",
 * hoặc bộ trường chung "Yêu cầu chung/Thực hiện/Thời gian/Trả kết quả/Phí dịch
 * vụ" cho nhóm Thay đổi ĐKKD, Giấy phép, Dịch vụ khác) — nhưng KHÔNG có nội
 * dung bên trong từng section, chỉ có tiêu đề. Để nhất quán với 2 hạng mục mẫu
 * ban đầu (đã có nội dung mẫu đầy đủ, không chỉ tiêu đề rỗng), nội dung các
 * section mới cũng được viết dạng mẫu hợp lý theo đúng bố cục demo, đánh dấu
 * `SAMPLE_TAG` ở phần dễ sai nhất (số liệu, điều kiện cụ thể) để khách biết
 * đâu là chỗ cần xác nhận/thay bằng nội dung chính thức.
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
        type: 'bulletList',
        title: 'Các loại hình doanh nghiệp',
        items: [
          `${SAMPLE_TAG} Công ty TNHH một thành viên — một cá nhân hoặc tổ chức làm chủ sở hữu.`,
          'Công ty TNHH hai thành viên trở lên — từ 02 đến 50 thành viên góp vốn.',
          'Công ty cổ phần — từ 03 cổ đông sáng lập trở lên, được phát hành cổ phần.',
          'Doanh nghiệp tư nhân — một cá nhân làm chủ, chịu trách nhiệm bằng toàn bộ tài sản.',
        ],
      },
      {
        type: 'bulletList',
        title: 'Thông tin cần cung cấp',
        items: [
          'Tên công ty dự kiến (2–3 phương án để tránh trùng tên).',
          'Địa chỉ trụ sở chính, ngành nghề kinh doanh dự kiến.',
          'Thông tin thành viên/cổ đông sáng lập và tỷ lệ vốn góp.',
          'Bản sao giấy tờ pháp lý của người đại diện và thành viên góp vốn.',
        ],
      },
      {
        type: 'bulletList',
        title: 'Thực hiện',
        items: [
          'Tư vấn loại hình phù hợp và rà soát tên, ngành nghề dự kiến.',
          'Soạn hồ sơ đăng ký doanh nghiệp và nộp tại Phòng Đăng ký kinh doanh.',
          'Nhận Giấy chứng nhận đăng ký doanh nghiệp, khắc dấu và công bố mẫu dấu.',
          'Hướng dẫn thủ tục sau thành lập (khai thuế ban đầu, hoá đơn, tài khoản ngân hàng).',
        ],
      },
      {
        type: 'pricingTable',
        rows: [
          { item: 'Công ty trong nước', scope: 'Soạn hồ sơ, nộp, nhận GCN ĐKDN, khắc dấu', fee: '1.200.000' },
        ],
        note: SAMPLE_TAG,
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
  {
    slug: 'thanh-lap-chi-nhanh-dia-diem-kinh-doanh',
    blocks: [
      {
        type: 'bulletList',
        title: 'Phân biệt chi nhánh và địa điểm kinh doanh',
        items: [
          `${SAMPLE_TAG} Chi nhánh — có mã số thuế riêng, được thực hiện toàn bộ hoặc một phần chức năng của công ty, kê khai thuế độc lập.`,
          'Địa điểm kinh doanh — không có mã số thuế riêng, chỉ là nơi tiến hành hoạt động kinh doanh cụ thể, kê khai thuế qua công ty hoặc chi nhánh chủ quản.',
        ],
      },
      {
        type: 'bulletList',
        title: 'Thông tin cần cung cấp',
        items: [
          'Tên chi nhánh/địa điểm kinh doanh dự kiến, địa chỉ đặt.',
          'Ngành nghề kinh doanh tại chi nhánh/địa điểm kinh doanh.',
          'Thông tin người đứng đầu chi nhánh/địa điểm kinh doanh.',
        ],
      },
      {
        type: 'bulletList',
        title: 'Thực hiện',
        items: [
          'Tư vấn lựa chọn hình thức phù hợp với nhu cầu hoạt động.',
          'Soạn hồ sơ và nộp tại cơ quan đăng ký kinh doanh nơi đặt chi nhánh/địa điểm.',
          'Nhận kết quả và hướng dẫn nghĩa vụ kê khai thuế phát sinh.',
        ],
      },
      {
        type: 'pricingTable',
        rows: [
          { item: 'Chi nhánh, địa điểm kinh doanh', scope: 'Soạn hồ sơ, nộp, nhận kết quả', fee: '1.000.000' },
        ],
        note: SAMPLE_TAG,
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
  {
    slug: 'thanh-lap-van-phong-dai-dien',
    blocks: [
      {
        type: 'bulletList',
        title: 'Phân biệt văn phòng đại diện với chi nhánh',
        items: [
          `${SAMPLE_TAG} Văn phòng đại diện — chỉ được thực hiện chức năng giao dịch, tìm hiểu thị trường, xúc tiến thương mại, KHÔNG được trực tiếp kinh doanh hay ký hợp đồng sinh lời.`,
          'Chi nhánh — được thực hiện toàn bộ hoặc một phần chức năng kinh doanh của công ty.',
        ],
      },
      {
        type: 'bulletList',
        title: 'Thông tin cần cung cấp',
        items: [
          'Tên văn phòng đại diện dự kiến, địa chỉ đặt.',
          'Nội dung hoạt động (giao dịch, xúc tiến thương mại...).',
          'Thông tin người đứng đầu văn phòng đại diện.',
        ],
      },
      {
        type: 'bulletList',
        title: 'Thực hiện',
        items: [
          'Tư vấn phạm vi hoạt động phù hợp quy định pháp luật.',
          'Soạn hồ sơ và nộp tại cơ quan đăng ký kinh doanh nơi đặt văn phòng.',
          'Nhận kết quả và hướng dẫn nghĩa vụ báo cáo hoạt động hằng năm.',
        ],
      },
      {
        type: 'pricingTable',
        rows: [{ item: 'Văn phòng đại diện', scope: 'Soạn hồ sơ, nộp, nhận kết quả', fee: '1.000.000' }],
        note: SAMPLE_TAG,
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
  {
    slug: 'thanh-lap-ho-kinh-doanh',
    blocks: [
      {
        type: 'bulletList',
        title: 'Điều kiện thành lập hộ kinh doanh',
        items: [
          `${SAMPLE_TAG} Cá nhân hoặc thành viên hộ gia đình là công dân Việt Nam từ đủ 18 tuổi.`,
          'Ngành nghề kinh doanh không thuộc danh mục cấm đầu tư kinh doanh.',
          'Chỉ được đăng ký một hộ kinh doanh trong phạm vi toàn quốc.',
        ],
      },
      {
        type: 'bulletList',
        title: 'Thông tin cần cung cấp',
        items: [
          'Tên hộ kinh doanh dự kiến, địa chỉ kinh doanh.',
          'Ngành nghề kinh doanh, vốn kinh doanh dự kiến.',
          'Bản sao giấy tờ pháp lý của chủ hộ kinh doanh và các thành viên (nếu có).',
        ],
      },
      {
        type: 'bulletList',
        title: 'Thực hiện',
        items: [
          'Tư vấn ngành nghề và soạn hồ sơ đăng ký hộ kinh doanh.',
          'Nộp hồ sơ tại cơ quan đăng ký kinh doanh cấp huyện nơi đặt trụ sở.',
          'Nhận Giấy chứng nhận đăng ký hộ kinh doanh và hướng dẫn nghĩa vụ thuế.',
        ],
      },
      {
        type: 'pricingTable',
        rows: [{ item: 'Hộ kinh doanh', scope: 'Hồ sơ, nộp UBND cấp huyện', fee: '800.000' }],
        note: SAMPLE_TAG,
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
  {
    slug: 'thanh-lap-cong-ty-von-nuoc-ngoai',
    blocks: [
      {
        type: 'bulletList',
        title: 'Các loại hình doanh nghiệp có vốn đầu tư nước ngoài',
        items: [
          `${SAMPLE_TAG} Thành lập tổ chức kinh tế mới có nhà đầu tư nước ngoài góp vốn.`,
          'Nhà đầu tư nước ngoài góp vốn, mua cổ phần/phần vốn góp vào công ty Việt Nam đang hoạt động.',
        ],
      },
      {
        type: 'bulletList',
        title: 'Thông tin cần cung cấp',
        items: [
          'Ngành nghề, quy mô vốn đầu tư và tỷ lệ sở hữu của nhà đầu tư nước ngoài.',
          'Giấy tờ pháp lý của nhà đầu tư (hộ chiếu cá nhân hoặc giấy phép thành lập tổ chức nước ngoài).',
          'Địa điểm thực hiện dự án đầu tư.',
        ],
      },
      {
        type: 'bulletList',
        title: 'Thực hiện',
        items: [
          'Tư vấn điều kiện tiếp cận thị trường theo ngành nghề dự kiến.',
          'Xin cấp Giấy chứng nhận đăng ký đầu tư (IRC).',
          'Xin cấp Giấy chứng nhận đăng ký doanh nghiệp (ERC) và khắc dấu.',
          'Hướng dẫn thủ tục mở tài khoản vốn đầu tư và các nghĩa vụ sau thành lập.',
        ],
      },
      {
        type: 'pricingTable',
        rows: [{ item: 'Công ty có vốn nước ngoài', scope: 'Tư vấn ngành nghề, IRC và ERC', fee: 'từ 12.000.000' }],
        note: SAMPLE_TAG,
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
  // --- Thay đổi ĐKKD (CATS.thaydoi.items, cùng nguồn) ---
  {
    slug: 'thay-doi-dia-chi',
    blocks: [
      {
        type: 'fieldTable',
        rows: [
          {
            label: 'Yêu cầu chung',
            value: `${SAMPLE_TAG} Doanh nghiệp đang hoạt động, đã hoàn tất nghĩa vụ thuế tại địa chỉ cũ (nếu chuyển khác quận/huyện).`,
          },
          {
            label: 'Thực hiện',
            value:
              'Tiếp nhận thông tin và rà soát điều kiện — trong ngày làm việc.\nSoạn hồ sơ, gửi khách hàng kiểm tra và ký.\nNộp hồ sơ tới cơ quan có thẩm quyền và theo dõi tiến độ.\nNhận kết quả, bàn giao và hướng dẫn nghĩa vụ tiếp theo.',
          },
          {
            label: 'Thời gian',
            value: '03 – 05 ngày kể từ khi nhận đủ hồ sơ hợp lệ.',
          },
          {
            label: 'Trả kết quả',
            value:
              'Bản gốc giấy chứng nhận hoặc văn bản chấp thuận của cơ quan có thẩm quyền.\nBộ hồ sơ đã nộp, có dấu tiếp nhận.',
          },
          { label: 'Phí dịch vụ', value: `${SAMPLE_TAG} 800.000.` },
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
  {
    slug: 'bo-sung-nganh-nghe',
    blocks: [
      {
        type: 'fieldTable',
        rows: [
          {
            label: 'Yêu cầu chung',
            value: `${SAMPLE_TAG} Ngành nghề bổ sung không thuộc danh mục cấm đầu tư kinh doanh, đáp ứng điều kiện ngành nghề có điều kiện (nếu có).`,
          },
          {
            label: 'Thực hiện',
            value:
              'Tiếp nhận thông tin và rà soát mã ngành phù hợp — trong ngày làm việc.\nSoạn hồ sơ, gửi khách hàng kiểm tra và ký.\nNộp hồ sơ tới cơ quan có thẩm quyền và theo dõi tiến độ.\nNhận kết quả, bàn giao và hướng dẫn nghĩa vụ tiếp theo.',
          },
          {
            label: 'Thời gian',
            value: '03 ngày kể từ khi nhận đủ hồ sơ hợp lệ.',
          },
          {
            label: 'Trả kết quả',
            value:
              'Giấy xác nhận thay đổi nội dung đăng ký doanh nghiệp.\nBộ hồ sơ đã nộp, có dấu tiếp nhận.',
          },
          { label: 'Phí dịch vụ', value: `${SAMPLE_TAG} 800.000.` },
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
  {
    slug: 'tang-giam-von-dieu-le',
    blocks: [
      {
        type: 'fieldTable',
        rows: [
          {
            label: 'Yêu cầu chung',
            value: `${SAMPLE_TAG} Vốn điều lệ sau thay đổi không thấp hơn mức vốn pháp định đối với ngành nghề kinh doanh có điều kiện (nếu có).`,
          },
          {
            label: 'Thực hiện',
            value:
              'Tiếp nhận thông tin và rà soát phương án tăng/giảm vốn — trong ngày làm việc.\nSoạn hồ sơ, gửi khách hàng kiểm tra và ký.\nNộp hồ sơ tới cơ quan có thẩm quyền và theo dõi tiến độ.\nNhận kết quả, bàn giao và hướng dẫn nghĩa vụ tiếp theo.',
          },
          {
            label: 'Thời gian',
            value: '03 – 05 ngày kể từ khi nhận đủ hồ sơ hợp lệ.',
          },
          {
            label: 'Trả kết quả',
            value:
              'Giấy xác nhận thay đổi nội dung đăng ký doanh nghiệp.\nBộ hồ sơ đã nộp, có dấu tiếp nhận.',
          },
          { label: 'Phí dịch vụ', value: `${SAMPLE_TAG} 1.000.000.` },
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
  {
    slug: 'thay-doi-co-dong',
    blocks: [
      {
        type: 'fieldTable',
        rows: [
          {
            label: 'Yêu cầu chung',
            value: `${SAMPLE_TAG} Có văn bản chuyển nhượng/thoả thuận giữa các cổ đông hoặc thành viên liên quan.`,
          },
          {
            label: 'Thực hiện',
            value:
              'Tiếp nhận thông tin và rà soát điều kiện chuyển nhượng — trong ngày làm việc.\nSoạn hồ sơ, gửi khách hàng kiểm tra và ký.\nNộp hồ sơ tới cơ quan có thẩm quyền và theo dõi tiến độ.\nNhận kết quả, bàn giao và hướng dẫn nghĩa vụ tiếp theo.',
          },
          {
            label: 'Thời gian',
            value: '05 ngày kể từ khi nhận đủ hồ sơ hợp lệ.',
          },
          {
            label: 'Trả kết quả',
            value:
              'Giấy xác nhận thay đổi nội dung đăng ký doanh nghiệp.\nBộ hồ sơ đã nộp, có dấu tiếp nhận.',
          },
          { label: 'Phí dịch vụ', value: `${SAMPLE_TAG} 1.000.000.` },
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
  {
    slug: 'thay-doi-dai-dien-phap-luat',
    blocks: [
      {
        type: 'fieldTable',
        rows: [
          {
            label: 'Yêu cầu chung',
            value: `${SAMPLE_TAG} Người đại diện pháp luật mới đủ điều kiện theo quy định (không thuộc trường hợp bị cấm quản lý doanh nghiệp).`,
          },
          {
            label: 'Thực hiện',
            value:
              'Tiếp nhận thông tin và rà soát điều kiện — trong ngày làm việc.\nSoạn hồ sơ, gửi khách hàng kiểm tra và ký.\nNộp hồ sơ tới cơ quan có thẩm quyền và theo dõi tiến độ.\nNhận kết quả, bàn giao và hướng dẫn nghĩa vụ tiếp theo.',
          },
          {
            label: 'Thời gian',
            value: '03 – 05 ngày kể từ khi nhận đủ hồ sơ hợp lệ.',
          },
          {
            label: 'Trả kết quả',
            value:
              'Giấy xác nhận thay đổi nội dung đăng ký doanh nghiệp.\nBộ hồ sơ đã nộp, có dấu tiếp nhận.',
          },
          { label: 'Phí dịch vụ', value: `${SAMPLE_TAG} 1.000.000.` },
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
  {
    slug: 'thay-doi-loai-hinh-cong-ty',
    blocks: [
      {
        type: 'fieldTable',
        rows: [
          {
            label: 'Yêu cầu chung',
            value: `${SAMPLE_TAG} Loại hình mới đáp ứng điều kiện về số lượng thành viên/cổ đông và cơ cấu vốn theo quy định.`,
          },
          {
            label: 'Thực hiện',
            value:
              'Tiếp nhận thông tin và tư vấn loại hình phù hợp — trong ngày làm việc.\nSoạn hồ sơ chuyển đổi loại hình, gửi khách hàng kiểm tra và ký.\nNộp hồ sơ tới cơ quan có thẩm quyền và theo dõi tiến độ.\nNhận kết quả, bàn giao và hướng dẫn nghĩa vụ tiếp theo.',
          },
          {
            label: 'Thời gian',
            value: '05 – 07 ngày kể từ khi nhận đủ hồ sơ hợp lệ.',
          },
          {
            label: 'Trả kết quả',
            value:
              'Giấy chứng nhận đăng ký doanh nghiệp theo loại hình mới.\nBộ hồ sơ đã nộp, có dấu tiếp nhận.',
          },
          { label: 'Phí dịch vụ', value: `${SAMPLE_TAG} 1.500.000.` },
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
  {
    slug: 'cap-nhat-thong-tin-cong-ty',
    blocks: [
      {
        type: 'fieldTable',
        rows: [
          {
            label: 'Yêu cầu chung',
            value: `${SAMPLE_TAG} Áp dụng cho các thay đổi thông tin không thuộc nhóm tên, địa chỉ, ngành nghề, vốn, thành viên hoặc đại diện pháp luật (ví dụ: số điện thoại, email đăng ký kinh doanh).`,
          },
          {
            label: 'Thực hiện',
            value:
              'Tiếp nhận thông tin cần cập nhật — trong ngày làm việc.\nSoạn hồ sơ, gửi khách hàng kiểm tra và ký.\nNộp hồ sơ tới cơ quan có thẩm quyền và theo dõi tiến độ.\nNhận kết quả, bàn giao và hướng dẫn nghĩa vụ tiếp theo.',
          },
          {
            label: 'Thời gian',
            value: '03 ngày kể từ khi nhận đủ hồ sơ hợp lệ.',
          },
          {
            label: 'Trả kết quả',
            value:
              'Giấy xác nhận thay đổi nội dung đăng ký doanh nghiệp.\nBộ hồ sơ đã nộp, có dấu tiếp nhận.',
          },
          { label: 'Phí dịch vụ', value: `${SAMPLE_TAG} 600.000.` },
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
  {
    slug: 'tam-ngung-hoat-dong',
    blocks: [
      {
        type: 'fieldTable',
        rows: [
          {
            label: 'Yêu cầu chung',
            value: `${SAMPLE_TAG} Đã hoàn tất nghĩa vụ thuế đến thời điểm đề nghị tạm ngừng, thông báo trước ít nhất 03 ngày làm việc.`,
          },
          {
            label: 'Thực hiện',
            value:
              'Tiếp nhận thông tin và rà soát nghĩa vụ thuế còn tồn đọng — trong ngày làm việc.\nSoạn hồ sơ, gửi khách hàng kiểm tra và ký.\nNộp hồ sơ tới cơ quan có thẩm quyền và theo dõi tiến độ.\nNhận kết quả, bàn giao và hướng dẫn nghĩa vụ tiếp theo.',
          },
          {
            label: 'Thời gian',
            value: '03 ngày kể từ khi nhận đủ hồ sơ hợp lệ.',
          },
          {
            label: 'Trả kết quả',
            value:
              'Giấy xác nhận tạm ngừng hoạt động kinh doanh.\nBộ hồ sơ đã nộp, có dấu tiếp nhận.',
          },
          { label: 'Phí dịch vụ', value: `${SAMPLE_TAG} 700.000.` },
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
  // --- Giấy phép hoạt động (PRICES.giayphep, cùng nguồn) ---
  {
    slug: 'gp-du-lich-lu-hanh',
    blocks: [
      {
        type: 'fieldTable',
        rows: [
          {
            label: 'Điều kiện cấp phép',
            value: `${SAMPLE_TAG} Doanh nghiệp có ngành nghề lữ hành, ký quỹ tại ngân hàng theo mức quy định, có người phụ trách kinh doanh dịch vụ lữ hành đáp ứng điều kiện chuyên môn.`,
          },
          {
            label: 'Thông tin cần cung cấp',
            value: 'Thông tin doanh nghiệp, phương án kinh doanh lữ hành, thông tin người phụ trách.',
          },
          {
            label: 'Thực hiện',
            value:
              'Tư vấn điều kiện và hướng dẫn thủ tục ký quỹ.\nSoạn hồ sơ và nộp tại Sở Du lịch/Sở Văn hoá, Thể thao và Du lịch.\nTheo dõi tiến độ và nhận kết quả.',
          },
          { label: 'Thời gian', value: '10 – 15 ngày kể từ khi nhận đủ hồ sơ hợp lệ.' },
          { label: 'Bảng giá', value: `${SAMPLE_TAG} từ 6.000.000.` },
        ],
      },
      {
        type: 'bulletList',
        title: 'Cam kết',
        items: [
          'Hồ sơ được soạn đúng quy định pháp luật hiện hành.',
          'Thực hiện đúng thời gian đã thông báo khi tiếp nhận hồ sơ.',
          'Phí báo trước, không phát sinh ngoài nội dung đã thoả thuận.',
        ],
      },
    ],
  },
  {
    slug: 'gp-kinh-doanh-ruou',
    blocks: [
      {
        type: 'fieldTable',
        rows: [
          {
            label: 'Điều kiện cấp phép',
            value: `${SAMPLE_TAG} Doanh nghiệp/hộ kinh doanh có đăng ký ngành nghề kinh doanh rượu, địa điểm kinh doanh cố định, đáp ứng điều kiện về phòng cháy chữa cháy.`,
          },
          {
            label: 'Thông tin cần cung cấp',
            value: 'Thông tin doanh nghiệp/hộ kinh doanh, địa điểm kinh doanh, hình thức kinh doanh rượu.',
          },
          {
            label: 'Thực hiện',
            value:
              'Tư vấn điều kiện và loại giấy phép phù hợp (bán buôn/bán lẻ).\nSoạn hồ sơ và nộp tại Phòng Kinh tế/Sở Công Thương.\nTheo dõi tiến độ và nhận kết quả.',
          },
          { label: 'Thời gian', value: '10 – 15 ngày kể từ khi nhận đủ hồ sơ hợp lệ.' },
          { label: 'Bảng giá', value: `${SAMPLE_TAG} từ 5.000.000.` },
        ],
      },
      {
        type: 'bulletList',
        title: 'Cam kết',
        items: [
          'Hồ sơ được soạn đúng quy định pháp luật hiện hành.',
          'Thực hiện đúng thời gian đã thông báo khi tiếp nhận hồ sơ.',
          'Phí báo trước, không phát sinh ngoài nội dung đã thoả thuận.',
        ],
      },
    ],
  },
  {
    slug: 'gp-ve-sinh-an-toan-thuc-pham',
    blocks: [
      {
        type: 'fieldTable',
        rows: [
          {
            label: 'Điều kiện cấp phép',
            value: `${SAMPLE_TAG} Cơ sở đáp ứng điều kiện về địa điểm, trang thiết bị, nguồn gốc nguyên liệu; nhân sự đã tập huấn kiến thức an toàn thực phẩm.`,
          },
          {
            label: 'Thông tin cần cung cấp',
            value: 'Thông tin cơ sở, ngành nghề sản xuất/kinh doanh thực phẩm, danh sách nhân sự trực tiếp sản xuất.',
          },
          {
            label: 'Thực hiện',
            value:
              'Tư vấn điều kiện cơ sở vật chất và hồ sơ tập huấn.\nSoạn hồ sơ, hỗ trợ thẩm định thực tế cơ sở.\nNộp hồ sơ và theo dõi kết quả thẩm định.',
          },
          { label: 'Thời gian', value: '15 – 20 ngày kể từ khi nhận đủ hồ sơ hợp lệ.' },
          { label: 'Bảng giá', value: `${SAMPLE_TAG} từ 5.000.000.` },
        ],
      },
      {
        type: 'bulletList',
        title: 'Cam kết',
        items: [
          'Hồ sơ được soạn đúng quy định pháp luật hiện hành.',
          'Thực hiện đúng thời gian đã thông báo khi tiếp nhận hồ sơ.',
          'Phí báo trước, không phát sinh ngoài nội dung đã thoả thuận.',
        ],
      },
    ],
  },
  {
    slug: 'gp-kinh-doanh-van-tai',
    blocks: [
      {
        type: 'fieldTable',
        rows: [
          {
            label: 'Điều kiện cấp phép',
            value: `${SAMPLE_TAG} Doanh nghiệp có phương tiện thuộc quyền sở hữu hoặc quyền sử dụng hợp pháp, đáp ứng điều kiện về người điều hành vận tải.`,
          },
          {
            label: 'Thông tin cần cung cấp',
            value: 'Thông tin doanh nghiệp, danh sách phương tiện, hình thức kinh doanh vận tải.',
          },
          {
            label: 'Thực hiện',
            value:
              'Tư vấn loại hình vận tải và điều kiện cấp phép.\nSoạn phương án kinh doanh, hồ sơ và nộp tại Sở Giao thông vận tải.\nTheo dõi tiến độ và nhận kết quả.',
          },
          { label: 'Thời gian', value: '07 – 10 ngày kể từ khi nhận đủ hồ sơ hợp lệ.' },
          { label: 'Bảng giá', value: `${SAMPLE_TAG} từ 4.000.000.` },
        ],
      },
      {
        type: 'bulletList',
        title: 'Cam kết',
        items: [
          'Hồ sơ được soạn đúng quy định pháp luật hiện hành.',
          'Thực hiện đúng thời gian đã thông báo khi tiếp nhận hồ sơ.',
          'Phí báo trước, không phát sinh ngoài nội dung đã thoả thuận.',
        ],
      },
    ],
  },
  {
    slug: 'gp-cho-thue-lai-lao-dong',
    blocks: [
      {
        type: 'fieldTable',
        rows: [
          {
            label: 'Điều kiện cấp phép',
            value: `${SAMPLE_TAG} Doanh nghiệp ký quỹ tại ngân hàng theo mức quy định, người đại diện đáp ứng điều kiện về trình độ và kinh nghiệm quản lý.`,
          },
          {
            label: 'Thông tin cần cung cấp',
            value: 'Thông tin doanh nghiệp, chứng từ ký quỹ, thông tin người đại diện theo pháp luật.',
          },
          {
            label: 'Thực hiện',
            value:
              'Tư vấn điều kiện và hướng dẫn thủ tục ký quỹ.\nSoạn hồ sơ và nộp tại Sở Lao động – Thương binh và Xã hội.\nTheo dõi tiến độ và nhận kết quả.',
          },
          { label: 'Thời gian', value: '20 – 30 ngày kể từ khi nhận đủ hồ sơ hợp lệ.' },
          { label: 'Bảng giá', value: `${SAMPLE_TAG} từ 15.000.000.` },
        ],
      },
      {
        type: 'bulletList',
        title: 'Cam kết',
        items: [
          'Hồ sơ được soạn đúng quy định pháp luật hiện hành.',
          'Thực hiện đúng thời gian đã thông báo khi tiếp nhận hồ sơ.',
          'Phí báo trước, không phát sinh ngoài nội dung đã thoả thuận.',
        ],
      },
    ],
  },
  // --- Dịch vụ khác (PRICES.dvkhac, cùng nguồn) ---
  {
    slug: 'xin-visa',
    blocks: [
      {
        type: 'fieldTable',
        rows: [
          {
            label: 'Yêu cầu chung',
            value: `${SAMPLE_TAG} Người nước ngoài có hộ chiếu còn thời hạn, mục đích nhập cảnh/tạm trú hợp lệ (lao động, đầu tư, du lịch...).`,
          },
          {
            label: 'Thực hiện',
            value:
              'Tiếp nhận thông tin và tư vấn loại visa/thị thực phù hợp — trong ngày làm việc.\nSoạn hồ sơ, gửi khách hàng kiểm tra và ký.\nNộp hồ sơ tại Cục Quản lý xuất nhập cảnh và theo dõi tiến độ.\nNhận kết quả, bàn giao cho khách hàng.',
          },
          { label: 'Thời gian', value: '05 – 07 ngày kể từ khi nhận đủ hồ sơ hợp lệ.' },
          { label: 'Trả kết quả', value: 'Visa/thẻ tạm trú theo loại đã đăng ký.\nBộ hồ sơ đã nộp, có dấu tiếp nhận.' },
          { label: 'Phí dịch vụ', value: `${SAMPLE_TAG} từ 3.000.000.` },
        ],
      },
      {
        type: 'bulletList',
        title: 'Cam kết',
        items: [
          'Hồ sơ được soạn đúng quy định pháp luật hiện hành.',
          'Thực hiện đúng thời gian đã thông báo khi tiếp nhận hồ sơ.',
          'Phí báo trước, không phát sinh ngoài nội dung đã thoả thuận.',
        ],
      },
    ],
  },
  {
    slug: 'xin-cap-giay-phep-lao-dong',
    blocks: [
      {
        type: 'fieldTable',
        rows: [
          {
            label: 'Yêu cầu chung',
            value: `${SAMPLE_TAG} Người lao động nước ngoài đủ 18 tuổi, có trình độ chuyên môn hoặc kinh nghiệm phù hợp vị trí công việc, đủ sức khoẻ, không có tiền án hình sự.`,
          },
          {
            label: 'Thực hiện',
            value:
              'Tiếp nhận thông tin và rà soát điều kiện — trong ngày làm việc.\nXin chấp thuận nhu cầu sử dụng lao động nước ngoài.\nSoạn hồ sơ xin cấp giấy phép lao động và nộp cơ quan có thẩm quyền.\nNhận kết quả, bàn giao cho khách hàng.',
          },
          { label: 'Thời gian', value: '15 – 20 ngày kể từ khi nhận đủ hồ sơ hợp lệ.' },
          {
            label: 'Trả kết quả',
            value: 'Giấy phép lao động bản gốc.\nBộ hồ sơ đã nộp, có dấu tiếp nhận.',
          },
          { label: 'Phí dịch vụ', value: `${SAMPLE_TAG} từ 6.000.000.` },
        ],
      },
      {
        type: 'bulletList',
        title: 'Cam kết',
        items: [
          'Hồ sơ được soạn đúng quy định pháp luật hiện hành.',
          'Thực hiện đúng thời gian đã thông báo khi tiếp nhận hồ sơ.',
          'Phí báo trước, không phát sinh ngoài nội dung đã thoả thuận.',
        ],
      },
    ],
  },
  {
    slug: 'dang-ky-nhan-hieu',
    blocks: [
      {
        type: 'fieldTable',
        rows: [
          {
            label: 'Yêu cầu chung',
            value: `${SAMPLE_TAG} Nhãn hiệu có khả năng phân biệt, không trùng hoặc gây nhầm lẫn với nhãn hiệu đã đăng ký cho cùng nhóm sản phẩm/dịch vụ.`,
          },
          {
            label: 'Thực hiện',
            value:
              'Tra cứu khả năng đăng ký và tư vấn phân nhóm sản phẩm/dịch vụ.\nSoạn đơn đăng ký và nộp tại Cục Sở hữu trí tuệ.\nTheo dõi tiến độ thẩm định qua các giai đoạn (hình thức, công bố, nội dung).\nNhận văn bằng bảo hộ khi được cấp.',
          },
          { label: 'Thời gian', value: '18 – 24 tháng kể từ ngày nộp đơn hợp lệ (theo quy trình của Cục SHTT).' },
          {
            label: 'Trả kết quả',
            value: 'Giấy chứng nhận đăng ký nhãn hiệu khi có kết quả cấp văn bằng.',
          },
          { label: 'Phí dịch vụ', value: `${SAMPLE_TAG} từ 2.500.000.` },
        ],
      },
      {
        type: 'bulletList',
        title: 'Cam kết',
        items: [
          'Hồ sơ được soạn đúng quy định pháp luật hiện hành.',
          'Theo sát tiến độ thẩm định tại Cục Sở hữu trí tuệ, thông báo khi có yêu cầu bổ sung.',
          'Phí báo trước, không phát sinh ngoài nội dung đã thoả thuận.',
        ],
      },
    ],
  },
  {
    slug: 'bao-hiem-xa-hoi',
    blocks: [
      {
        type: 'fieldTable',
        rows: [
          {
            label: 'Yêu cầu chung',
            value: `${SAMPLE_TAG} Doanh nghiệp có người lao động thuộc diện tham gia BHXH bắt buộc theo hợp đồng lao động.`,
          },
          {
            label: 'Thực hiện',
            value:
              'Tiếp nhận thông tin doanh nghiệp và người lao động — trong ngày làm việc.\nSoạn hồ sơ đăng ký đơn vị và hồ sơ tham gia cho từng lao động.\nNộp hồ sơ tại cơ quan BHXH và theo dõi tiến độ.\nBàn giao sổ BHXH, thẻ BHYT cho khách hàng.',
          },
          { label: 'Thời gian', value: '05 ngày kể từ khi nhận đủ hồ sơ hợp lệ.' },
          {
            label: 'Trả kết quả',
            value: 'Mã đơn vị tham gia BHXH.\nSổ BHXH, thẻ BHYT của người lao động.',
          },
          { label: 'Phí dịch vụ', value: `${SAMPLE_TAG} 800.000.` },
        ],
      },
      {
        type: 'bulletList',
        title: 'Cam kết',
        items: [
          'Hồ sơ được soạn đúng quy định pháp luật hiện hành.',
          'Thực hiện đúng thời gian đã thông báo khi tiếp nhận hồ sơ.',
          'Phí báo trước, không phát sinh ngoài nội dung đã thoả thuận.',
        ],
      },
    ],
  },
  {
    slug: 'dau-bien',
    blocks: [
      {
        type: 'fieldTable',
        rows: [
          {
            label: 'Yêu cầu chung',
            value: `${SAMPLE_TAG} Doanh nghiệp đã có Giấy chứng nhận đăng ký doanh nghiệp; nội dung biển hiệu, mẫu dấu tuân thủ quy định.`,
          },
          {
            label: 'Thực hiện',
            value:
              'Tiếp nhận yêu cầu về mẫu dấu, kích thước và nội dung biển hiệu — trong ngày làm việc.\nĐặt khắc dấu/làm biển hiệu tại đơn vị gia công.\nBàn giao dấu, biển hiệu cho khách hàng.',
          },
          { label: 'Thời gian', value: '02 – 03 ngày kể từ khi chốt mẫu.' },
          { label: 'Trả kết quả', value: 'Con dấu và/hoặc biển hiệu theo mẫu đã chốt.' },
          { label: 'Phí dịch vụ', value: `${SAMPLE_TAG} từ 500.000.` },
        ],
      },
      {
        type: 'bulletList',
        title: 'Cam kết',
        items: [
          'Thực hiện đúng thời gian đã thông báo khi chốt mẫu.',
          'Phí báo trước, không phát sinh ngoài nội dung đã thoả thuận.',
        ],
      },
    ],
  },
  {
    slug: 'chu-ky-so',
    blocks: [
      {
        type: 'fieldTable',
        rows: [
          {
            label: 'Yêu cầu chung',
            value: `${SAMPLE_TAG} Doanh nghiệp đã có Giấy chứng nhận đăng ký doanh nghiệp và mã số thuế còn hoạt động.`,
          },
          {
            label: 'Thực hiện',
            value:
              'Tiếp nhận thông tin doanh nghiệp và người đại diện — trong ngày làm việc.\nĐăng ký chữ ký số với nhà cung cấp dịch vụ.\nBàn giao thiết bị/chứng thư số và hướng dẫn sử dụng.',
          },
          { label: 'Thời gian', value: '01 ngày kể từ khi nhận đủ thông tin.' },
          { label: 'Trả kết quả', value: 'Thiết bị USB Token hoặc chứng thư số kèm hướng dẫn cài đặt, sử dụng.' },
          { label: 'Phí dịch vụ', value: `${SAMPLE_TAG} từ 500.000.` },
        ],
      },
      {
        type: 'bulletList',
        title: 'Cam kết',
        items: [
          'Thực hiện đúng thời gian đã thông báo khi tiếp nhận thông tin.',
          'Phí báo trước, không phát sinh ngoài nội dung đã thoả thuận.',
        ],
      },
    ],
  },
  {
    slug: 'ke-toan-noi-bo',
    summary: 'Phạm vi trọn gói, các phần hành và lý do nên dùng dịch vụ kế toán nội bộ.',
    blocks: [
      {
        type: 'bulletList',
        title: 'Phạm vi trọn gói',
        items: [
          `${SAMPLE_TAG} Đảm nhiệm toàn bộ công tác kế toán nội bộ doanh nghiệp: hạch toán, lên sổ sách, báo cáo quản trị theo yêu cầu.`,
          'Làm việc trực tiếp hoặc từ xa theo thoả thuận, phối hợp với kế toán thuế của doanh nghiệp.',
        ],
      },
      {
        type: 'bulletList',
        title: 'Phần hành lương',
        items: [
          'Tính lương, các khoản trích theo lương (BHXH, BHYT, BHTN, thuế TNCN).',
          'Lập bảng lương, phiếu lương hằng tháng cho người lao động.',
        ],
      },
      {
        type: 'bulletList',
        title: 'Phần hành bán hàng',
        items: [
          'Theo dõi doanh thu bán hàng, xuất hoá đơn theo nghiệp vụ phát sinh.',
          'Đối chiếu công nợ phải thu với khách hàng.',
        ],
      },
      {
        type: 'bulletList',
        title: 'Phần hành kho',
        items: [
          'Theo dõi nhập – xuất – tồn kho theo chứng từ phát sinh.',
          'Đối chiếu số liệu kho với sổ sách kế toán định kỳ.',
        ],
      },
      {
        type: 'bulletList',
        title: 'Phần hành công nợ',
        items: [
          'Theo dõi công nợ phải thu, phải trả theo từng đối tượng.',
          'Lập báo cáo tuổi nợ và nhắc thu hồi công nợ đến hạn.',
        ],
      },
      {
        type: 'bulletList',
        title: 'Tổng hợp kết quả kinh doanh',
        items: [
          'Lập báo cáo kết quả kinh doanh định kỳ (tháng/quý) theo yêu cầu quản trị.',
          'Đối chiếu số liệu tổng hợp với các phần hành trước khi báo cáo.',
        ],
      },
      {
        type: 'bulletList',
        title: 'Tại sao nên dùng dịch vụ kế toán nội bộ',
        items: [
          'Tiết kiệm chi phí so với tuyển dụng và duy trì bộ phận kế toán nội bộ riêng.',
          'Số liệu được đối chiếu bởi đội ngũ có kinh nghiệm nhiều doanh nghiệp, hạn chế sai sót.',
          'Chủ động về nhân sự — không gián đoạn khi nhân viên nghỉ việc.',
        ],
      },
    ],
  },
  {
    slug: 'kiem-tra-soat-xet-ho-so-ke-toan',
    summary: 'Nhiệm vụ của HIACC, nhiệm vụ của khách hàng và cam kết khi soát xét hồ sơ kế toán.',
    blocks: [
      {
        type: 'bulletList',
        title: 'Nhiệm vụ của HIACC',
        items: [
          `${SAMPLE_TAG} Rà soát tính hợp lệ, hợp lý, hợp pháp của chứng từ và sổ sách kế toán đã lập.`,
          'Chỉ ra sai sót, rủi ro về thuế và đề xuất phương án khắc phục.',
          'Lập báo cáo soát xét kèm danh mục các điểm cần điều chỉnh.',
        ],
      },
      {
        type: 'bulletList',
        title: 'Nhiệm vụ của khách hàng',
        items: [
          'Cung cấp đầy đủ sổ sách, chứng từ kế toán trong kỳ cần soát xét.',
          'Phối hợp giải trình các nghiệp vụ khi được yêu cầu làm rõ.',
        ],
      },
      {
        type: 'bulletList',
        title: 'Cam kết',
        items: [
          'Bảo mật toàn bộ số liệu và tài liệu kế toán của khách hàng.',
          'Báo cáo soát xét khách quan, đúng thời gian đã thông báo.',
        ],
      },
    ],
  },
  {
    slug: 'quyet-toan-thue',
    summary: 'Các trường hợp quyết toán thuế, nhiệm vụ của HIACC, nhiệm vụ của khách hàng và cam kết.',
    blocks: [
      {
        type: 'bulletList',
        title: 'Các trường hợp quyết toán thuế',
        items: [
          `${SAMPLE_TAG} Quyết toán thuế thu nhập doanh nghiệp theo năm tài chính.`,
          'Quyết toán thuế thu nhập cá nhân cho người lao động.',
          'Quyết toán theo yêu cầu thanh tra, kiểm tra của cơ quan thuế.',
        ],
      },
      {
        type: 'bulletList',
        title: 'Nhiệm vụ của HIACC',
        items: [
          'Rà soát hồ sơ, chứng từ liên quan đến kỳ quyết toán.',
          'Lập tờ khai quyết toán thuế và làm việc với cơ quan thuế khi cần.',
        ],
      },
      {
        type: 'bulletList',
        title: 'Nhiệm vụ của khách hàng',
        items: [
          'Cung cấp đầy đủ chứng từ, sổ sách liên quan đến kỳ quyết toán.',
          'Phối hợp giải trình khi cơ quan thuế yêu cầu.',
        ],
      },
      {
        type: 'bulletList',
        title: 'Cam kết',
        items: [
          'Hồ sơ quyết toán được lập đúng quy định pháp luật hiện hành.',
          'Đồng hành cùng khách hàng đến khi có kết quả quyết toán cuối cùng.',
        ],
      },
    ],
  },
  {
    slug: 'hoan-thue-gtgt',
    summary: 'Đối tượng được hoàn thuế GTGT, nhiệm vụ của HIACC, nhiệm vụ của khách hàng và cam kết.',
    blocks: [
      {
        type: 'bulletList',
        title: 'Đối tượng được hoàn thuế GTGT',
        items: [
          `${SAMPLE_TAG} Doanh nghiệp có dự án đầu tư mới, số thuế GTGT đầu vào chưa khấu trừ hết.`,
          'Doanh nghiệp xuất khẩu có số thuế GTGT đầu vào chưa khấu trừ hết theo quy định.',
          'Doanh nghiệp giải thể, phá sản, chấm dứt hoạt động có số thuế GTGT nộp thừa.',
        ],
      },
      {
        type: 'bulletList',
        title: 'Nhiệm vụ của HIACC',
        items: [
          'Rà soát điều kiện hoàn thuế và chuẩn bị hồ sơ theo quy định.',
          'Nộp hồ sơ hoàn thuế và làm việc với cơ quan thuế trong quá trình kiểm tra.',
        ],
      },
      {
        type: 'bulletList',
        title: 'Nhiệm vụ của khách hàng',
        items: [
          'Cung cấp đầy đủ hoá đơn, chứng từ liên quan đến số thuế đề nghị hoàn.',
          'Phối hợp giải trình khi cơ quan thuế kiểm tra hồ sơ hoàn thuế.',
        ],
      },
      {
        type: 'bulletList',
        title: 'Cam kết',
        items: [
          'Hồ sơ hoàn thuế được lập đúng quy định pháp luật hiện hành.',
          'Theo sát tiến độ xử lý hồ sơ tại cơ quan thuế.',
        ],
      },
    ],
  },
  {
    slug: 'quyet-toan-giai-the',
    summary: 'Nhiệm vụ của HIACC, nhiệm vụ của khách hàng và cam kết khi quyết toán giải thể.',
    blocks: [
      {
        type: 'bulletList',
        title: 'Nhiệm vụ của HIACC',
        items: [
          `${SAMPLE_TAG} Rà soát toàn bộ nghĩa vụ thuế còn tồn đọng trước khi lập hồ sơ giải thể.`,
          'Lập báo cáo quyết toán thuế đến thời điểm giải thể và làm việc với cơ quan thuế.',
        ],
      },
      {
        type: 'bulletList',
        title: 'Nhiệm vụ của khách hàng',
        items: [
          'Cung cấp đầy đủ sổ sách, chứng từ từ khi thành lập đến thời điểm giải thể.',
          'Hoàn tất các nghĩa vụ tài chính còn tồn đọng theo yêu cầu.',
        ],
      },
      {
        type: 'bulletList',
        title: 'Cam kết',
        items: [
          'Hồ sơ quyết toán giải thể được lập đúng quy định pháp luật hiện hành.',
          'Đồng hành cùng khách hàng đến khi hoàn tất thủ tục giải thể.',
        ],
      },
    ],
  },
  {
    slug: 'bao-cao-tai-chinh',
    summary:
      'Thời hạn nộp báo cáo tài chính, nhiệm vụ của HIACC, nhiệm vụ của khách hàng và cam kết.',
    blocks: [
      {
        type: 'bulletList',
        title: 'Thời hạn nộp báo cáo tài chính',
        items: [
          `${SAMPLE_TAG} Chậm nhất 90 ngày kể từ ngày kết thúc năm tài chính đối với doanh nghiệp thông thường.`,
          'Thời hạn khác áp dụng theo quy định riêng cho từng loại hình doanh nghiệp.',
        ],
      },
      {
        type: 'bulletList',
        title: 'Nhiệm vụ của HIACC',
        items: [
          'Lập báo cáo tài chính theo chuẩn mực kế toán hiện hành.',
          'Nộp báo cáo đúng thời hạn tới các cơ quan quản lý liên quan.',
        ],
      },
      {
        type: 'bulletList',
        title: 'Nhiệm vụ của khách hàng',
        items: [
          'Cung cấp đầy đủ sổ sách, chứng từ kế toán trong năm tài chính.',
          'Xác nhận số liệu trước khi báo cáo được nộp chính thức.',
        ],
      },
      {
        type: 'bulletList',
        title: 'Cam kết',
        items: [
          'Báo cáo tài chính được lập đúng chuẩn mực và quy định pháp luật hiện hành.',
          'Nộp đúng thời hạn quy định, không phát sinh chậm nộp do lỗi của HIACC.',
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
