import type { GlobalConfig, Validate } from 'payload'
import { isAdmin, isPublic } from '../access'

/**
 * Global `payroll-config` — số liệu luật của công cụ tính lương Gross ↔ Net (gói W5).
 *
 * Vì sao là global chứ không phải hằng trong code (contract W5 §2.6, user chốt 30/08):
 * bảng thuế, giảm trừ gia cảnh và trần bảo hiểm đổi theo năm. Kế toán của khách phải
 * tự sửa được và tự VERIFY được số đang áp dụng, không cần lập trình viên, không deploy lại.
 *
 * ⚠️ NGUỒN SỐ LIỆU: mọi `defaultValue` dưới đây là số PM cấp ở contract W5 §2, chép
 * nguyên văn. KHÔNG tra web, KHÔNG suy luận thêm số nào. Trùng khớp với
 * DEFAULT_PAYROLL_CONFIG trong src/lib/payroll/config.ts (fallback khi global lỗi/rỗng) —
 * sửa một chỗ phải sửa cả hai.
 *
 * Đọc ở đâu: src/lib/payroll/global.ts → normalizePayrollConfig() → trang
 * /cong-cu/tinh-luong. Global lỗi/rỗng thì trang dùng fallback, không trắng.
 */

/** Thông báo lỗi validate — gom một chỗ để câu chữ nhất quán trong /admin. */
const ERR = {
  required: 'Bắt buộc nhập.',
  notNumber: 'Phải là một con số.',
  negative: 'Không được là số âm.',
  percentRange: 'Tỷ lệ phần trăm phải nằm trong khoảng 0 đến 100.',
  bracketsEmpty: 'Phải có ít nhất 1 bậc thuế.',
  bracketsOrder:
    'Các bậc thuế phải sắp xếp tăng dần theo "Đến mức thu nhập". Bậc cuối (bỏ trống ngưỡng = không giới hạn) phải nằm ở dòng cuối cùng.',
  bracketsLastOnly: 'Chỉ bậc CUỐI CÙNG được bỏ trống ngưỡng "Đến mức thu nhập".',
  multiplierPositive: 'Phải lớn hơn 0.',
}

/** Số tiền: bắt buộc, là số, không âm. Dùng cho mọi field tiền trong global này. */
const validateMoney: Validate<number | null | undefined> = (value) => {
  if (value === null || value === undefined || (value as unknown) === '') return ERR.required
  if (typeof value !== 'number' || !Number.isFinite(value)) return ERR.notNumber
  if (value < 0) return ERR.negative
  return true
}

/** Tỷ lệ phần trăm: bắt buộc, là số, trong [0, 100]. */
const validatePercent: Validate<number | null | undefined> = (value) => {
  if (value === null || value === undefined || (value as unknown) === '') return ERR.required
  if (typeof value !== 'number' || !Number.isFinite(value)) return ERR.notNumber
  if (value < 0 || value > 100) return ERR.percentRange
  return true
}

/** Bội số trần BHTN: bắt buộc, là số, lớn hơn 0 (bằng 0 nghĩa là trần = 0 → vô nghĩa). */
const validatePositive: Validate<number | null | undefined> = (value) => {
  if (value === null || value === undefined || (value as unknown) === '') return ERR.required
  if (typeof value !== 'number' || !Number.isFinite(value)) return ERR.notNumber
  if (value <= 0) return ERR.multiplierPositive
  return true
}

/**
 * Validate cả MẢNG bậc thuế (đặt ở field `taxBrackets`, không phải ở từng dòng):
 * thứ tự tăng dần chỉ kiểm được khi nhìn toàn bảng.
 *
 * Luật: ít nhất 1 bậc · `upTo` tăng dần nghiêm ngặt · chỉ dòng CUỐI được bỏ trống
 * `upTo` (= bậc không trần). Sai thì admin báo lỗi, KHÔNG cho lưu — lưu được bảng
 * thuế vô lý là tính sai lương thật của người khác.
 */
const validateTaxBrackets: Validate<unknown> = (value) => {
  if (!Array.isArray(value) || value.length === 0) return ERR.bracketsEmpty

  let previous = -Infinity
  for (let i = 0; i < value.length; i++) {
    const row = value[i] as { upTo?: number | null } | null
    const upTo = row?.upTo

    if (upTo === null || upTo === undefined || (upTo as unknown) === '') {
      // Bậc không trần: chỉ được là dòng cuối cùng.
      if (i !== value.length - 1) return ERR.bracketsLastOnly
      continue
    }
    if (typeof upTo !== 'number' || !Number.isFinite(upTo)) return ERR.notNumber
    if (upTo <= 0) return ERR.negative
    if (upTo <= previous) return ERR.bracketsOrder
    previous = upTo
  }
  return true
}

export const PayrollConfig: GlobalConfig = {
  slug: 'payroll-config',
  label: 'Cấu hình tính lương',
  admin: {
    // Cùng nhóm với Settings để kế toán tìm thấy ở một chỗ trong menu /admin.
    group: 'Cấu hình',
    description:
      'Số liệu luật dùng cho công cụ tính lương Gross ↔ Net tại /cong-cu/tinh-luong: giảm trừ gia cảnh, biểu thuế TNCN, tỷ lệ và trần bảo hiểm, lương tối thiểu vùng. Sửa ở đây là trang tính lương đổi theo ngay, không cần lập trình viên. Chỉ Quản trị viên sửa được.',
  },
  /**
   * Quyền: copy đúng pattern của globals/Settings.ts (gói F1/W4 đã đặt).
   *
   * `read: isPublic` — BẮT BUỘC giữ public: trang /cong-cu/tinh-luong là trang ngoài,
   * gọi Local API không kèm user; siết `read` lại là trang rơi về fallback vĩnh viễn
   * và ô "sửa trong admin thấy đổi ngay" mất tác dụng. Global này không chứa dữ liệu
   * riêng tư — chỉ là số liệu luật vốn công khai.
   *
   * `update: isAdmin` — chỉ role admin. Hàm này đọc `req.user` nên chặn CẢ đường REST
   * `POST /api/globals/payroll-config` lẫn màn hình /admin: khách vãng lai (`req.user`
   * null) và editor đều trượt. Không có nhánh `req.payloadAPI === 'local'` mở sẵn ở đây —
   * seed dùng Local API với quyền server nên không cần, và thêm nhánh đó là mở lại đúng
   * lỗ REST bypass mà F1 đã vá ở ContactSubmissions.
   */
  access: { read: isPublic, update: isAdmin },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Giảm trừ & thuế',
          fields: [
            {
              name: 'personalDeduction',
              type: 'number',
              label: 'Giảm trừ gia cảnh cho bản thân (đồng/tháng)',
              required: true,
              defaultValue: 15500000,
              validate: validateMoney,
              admin: {
                description:
                  'Mức giảm trừ cho chính người nộp thuế, trừ khỏi thu nhập trước khi tính thuế. Mặc định 15.500.000 đ/tháng (186 triệu/năm) theo Nghị quyết 110/2025/UBTVQH15, áp dụng từ kỳ tính thuế 2026.',
              },
            },
            {
              name: 'dependentDeduction',
              type: 'number',
              label: 'Giảm trừ cho mỗi người phụ thuộc (đồng/tháng)',
              required: true,
              defaultValue: 6200000,
              validate: validateMoney,
              admin: {
                description:
                  'Mức giảm trừ cho MỖI người phụ thuộc đã đăng ký (con nhỏ, cha mẹ già…). Mặc định 6.200.000 đ/tháng theo Nghị quyết 110/2025/UBTVQH15.',
              },
            },
            {
              name: 'taxBrackets',
              type: 'array',
              label: 'Biểu thuế thu nhập cá nhân lũy tiến từng phần',
              required: true,
              minRows: 1,
              validate: validateTaxBrackets,
              defaultValue: [
                { upTo: 10000000, rate: 5 },
                { upTo: 30000000, rate: 10 },
                { upTo: 60000000, rate: 20 },
                { upTo: 100000000, rate: 30 },
                { upTo: null, rate: 35 },
              ],
              admin: {
                description:
                  'Biểu thuế 5 bậc theo Luật Thuế thu nhập cá nhân 2025 (Luật 109/2025/QH15), hiệu lực 01/01/2026 cho thu nhập từ tiền lương. Tính LŨY TIẾN TỪNG PHẦN: mỗi bậc chỉ áp thuế suất cho phần thu nhập nằm trong bậc đó, không áp một thuế suất cho toàn bộ. Các dòng phải xếp tăng dần theo ngưỡng; dòng cuối bỏ trống ngưỡng nghĩa là bậc cao nhất không giới hạn.',
                initCollapsed: false,
              },
              fields: [
                {
                  name: 'upTo',
                  type: 'number',
                  label: 'Đến mức thu nhập tính thuế (đồng/tháng)',
                  admin: {
                    description:
                      'Ngưỡng TRÊN của bậc này, tính trên thu nhập TÍNH THUẾ (đã trừ bảo hiểm và giảm trừ gia cảnh). BỎ TRỐNG ở dòng cuối cùng = bậc cao nhất, không có trần.',
                  },
                },
                {
                  name: 'rate',
                  type: 'number',
                  label: 'Thuế suất (%)',
                  required: true,
                  validate: validatePercent,
                  admin: {
                    description:
                      'Nhập theo đơn vị phần trăm: gõ 5 nghĩa là 5%, không gõ 0.05. Phải trong khoảng 0–100.',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Bảo hiểm',
          fields: [
            {
              name: 'insuranceRates',
              type: 'group',
              label: 'Tỷ lệ bảo hiểm người lao động đóng',
              admin: {
                description:
                  'CHỈ phần NGƯỜI LAO ĐỘNG chịu, tổng 10,5% — đây là phần trừ vào lương. Phần doanh nghiệp đóng (21,5%) KHÔNG trừ vào lương nên không khai ở đây. Căn cứ: Luật Bảo hiểm xã hội 2024 (số 41/2024/QH15), Nghị định 158/2025/NĐ-CP, Nghị định 188/2025/NĐ-CP, từ 01/01/2026.',
              },
              fields: [
                {
                  name: 'social',
                  type: 'number',
                  label: 'Bảo hiểm xã hội — BHXH (%)',
                  required: true,
                  defaultValue: 8,
                  validate: validatePercent,
                  admin: {
                    description:
                      'Phần người lao động đóng, mặc định 8%. Nhập 8 nghĩa là 8%. Áp trên lương đóng bảo hiểm nhưng không vượt "Trần đóng BHXH và BHYT" bên dưới.',
                  },
                },
                {
                  name: 'health',
                  type: 'number',
                  label: 'Bảo hiểm y tế — BHYT (%)',
                  required: true,
                  defaultValue: 1.5,
                  validate: validatePercent,
                  admin: {
                    description:
                      'Phần người lao động đóng, mặc định 1,5%. Nhập 1.5 (dùng dấu chấm thập phân). Dùng chung trần với BHXH.',
                  },
                },
                {
                  name: 'unemployment',
                  type: 'number',
                  label: 'Bảo hiểm thất nghiệp — BHTN (%)',
                  required: true,
                  defaultValue: 1,
                  validate: validatePercent,
                  admin: {
                    description:
                      'Phần người lao động đóng, mặc định 1%. Lưu ý BHTN dùng TRẦN RIÊNG, tính theo lương tối thiểu vùng — xem tab "Vùng lương" chứ không dùng trần BHXH/BHYT.',
                  },
                },
              ],
            },
            {
              name: 'insuranceCap',
              type: 'number',
              label: 'Trần đóng BHXH và BHYT (đồng/tháng)',
              required: true,
              defaultValue: 46800000,
              validate: validateMoney,
              admin: {
                description:
                  '⚠️ SỐ NÀY CHƯA ĐƯỢC XÁC MINH — cần kế toán của khách xác nhận trước khi công bố trang. Lương cao hơn mức này thì BHXH và BHYT DỪNG ở mức này, không đóng thêm. Mặc định 46.800.000 đ = 20 × mức tham chiếu 2.340.000 đ. Có nguồn khác nêu 50.600.000 đ (từ 01/07/2026); dự án chọn 46.800.000 đ vì căn cứ "20 lần mức tham chiếu" rõ ràng hơn. Xác nhận xong thì sửa lại ô này.',
              },
            },
            {
              name: 'unemploymentCapMultiplier',
              type: 'number',
              label: 'Bội số trần bảo hiểm thất nghiệp',
              required: true,
              defaultValue: 20,
              validate: validatePositive,
              admin: {
                description:
                  'Trần đóng BHTN = số này × lương tối thiểu của VÙNG người dùng chọn (căn cứ khác với trần BHXH/BHYT ở trên). Mặc định 20. Ví dụ Vùng I: 20 × 5.310.000 = 106.200.000 đ/tháng.',
              },
            },
          ],
        },
        {
          label: 'Vùng lương',
          fields: [
            {
              name: 'regions',
              type: 'array',
              label: 'Lương tối thiểu vùng',
              required: true,
              minRows: 1,
              maxRows: 4,
              defaultValue: [
                { code: 'I', minWage: 5310000 },
                { code: 'II', minWage: 4730000 },
                { code: 'III', minWage: 4140000 },
                { code: 'IV', minWage: 3700000 },
              ],
              admin: {
                description:
                  'Lương tối thiểu 4 vùng theo Nghị định 293/2025/NĐ-CP, áp dụng 2026. Dùng để tính TRẦN đóng bảo hiểm thất nghiệp theo vùng người dùng chọn trên trang tính lương.',
                initCollapsed: false,
              },
              fields: [
                {
                  name: 'code',
                  type: 'select',
                  label: 'Vùng',
                  required: true,
                  options: [
                    { label: 'Vùng I', value: 'I' },
                    { label: 'Vùng II', value: 'II' },
                    { label: 'Vùng III', value: 'III' },
                    { label: 'Vùng IV', value: 'IV' },
                  ],
                  admin: {
                    description:
                      'Vùng theo phân loại của Nghị định lương tối thiểu vùng. Mỗi vùng chỉ khai một dòng.',
                  },
                },
                {
                  name: 'minWage',
                  type: 'number',
                  label: 'Lương tối thiểu vùng (đồng/tháng)',
                  required: true,
                  validate: validateMoney,
                  admin: {
                    description:
                      'Mặc định: Vùng I 5.310.000 đ · Vùng II 4.730.000 đ · Vùng III 4.140.000 đ · Vùng IV 3.700.000 đ.',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Căn cứ pháp lý',
          fields: [
            {
              name: 'effectiveFrom',
              type: 'text',
              label: 'Áp dụng từ ngày',
              required: true,
              defaultValue: '2026-01-01',
              admin: {
                description:
                  'Mốc hiệu lực của bộ số ở trên. Hiện công khai trên trang tính lương để người dùng biết đang áp luật mốc nào. Nên viết dạng 2026-01-01.',
              },
            },
            {
              name: 'legalBasis',
              type: 'textarea',
              label: 'Căn cứ pháp lý',
              required: true,
              defaultValue: [
                'Giảm trừ gia cảnh: Nghị quyết 110/2025/UBTVQH15 (áp dụng từ kỳ tính thuế 2026).',
                'Biểu thuế thu nhập cá nhân lũy tiến 5 bậc: Luật Thuế thu nhập cá nhân 2025 (Luật 109/2025/QH15), phần thu nhập từ tiền lương hiệu lực 01/01/2026.',
                'Tỷ lệ bảo hiểm người lao động đóng (BHXH 8%, BHYT 1,5%, BHTN 1%): Luật Bảo hiểm xã hội 2024 (số 41/2024/QH15), Nghị định 158/2025/NĐ-CP, Nghị định 188/2025/NĐ-CP.',
                'Lương tối thiểu vùng: Nghị định 293/2025/NĐ-CP.',
              ].join('\n'),
              admin: {
                description:
                  'Danh sách văn bản pháp luật làm căn cứ cho các số ở trên. Hiện công khai trên trang tính lương để người dùng tự đối chiếu. Mỗi căn cứ một dòng. Sửa số ở các tab khác thì nhớ cập nhật lại dòng căn cứ tương ứng ở đây.',
              },
            },
          ],
        },
      ],
    },
  ],
}
