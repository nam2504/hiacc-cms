/**
 * Hàm tính lương Gross ↔ Net (gói W5, contract §3).
 *
 * ⚠️ File này KHÔNG import DEFAULT_PAYROLL_CONFIG hay bất kỳ hằng số liệu luật nào.
 * Mọi số đi vào qua tham số `config: PayrollConfig` — nhờ vậy test truyền được config
 * cố định và trang truyền được config lấy từ global /admin (contract §2.6).
 *
 * Tính hoàn toàn ở client, không fetch, không ghi DB: lương là dữ liệu nhạy cảm.
 */
import type { PayrollConfig, RegionCode, TaxBracket } from './config'
import { findRegion } from './config'

/** Một bậc thuế đã áp thực tế — dùng để hiện bảng bóc tách cho người dùng đối chiếu tay. */
export type AppliedBracket = {
  /** Thứ tự bậc, bắt đầu từ 1. */
  order: number
  /** Cận dưới của bậc (đồng). */
  from: number
  /** Cận trên của bậc (đồng), null = không giới hạn. */
  to: number | null
  rate: number
  /** Phần thu nhập tính thuế rơi vào bậc này. */
  taxableInBracket: number
  /** Tiền thuế của riêng bậc này. */
  tax: number
}

export type PayrollBreakdown = {
  gross: number
  /** Mức lương dùng làm căn cứ đóng bảo hiểm (mặc định = gross). */
  insuranceBase: number
  socialInsurance: number
  healthInsurance: number
  unemploymentInsurance: number
  totalInsurance: number
  /** Gross − tổng bảo hiểm. */
  incomeBeforeTax: number
  /** Giảm trừ bản thân + người phụ thuộc. */
  totalDeduction: number
  personalDeduction: number
  dependentDeductionTotal: number
  /** Thu nhập tính thuế (không âm). */
  taxableIncome: number
  personalIncomeTax: number
  appliedBrackets: AppliedBracket[]
  net: number
  /** Trần đã áp cho BHXH/BHYT — hiện lên để người dùng biết vì sao khoản dừng lại. */
  socialCapApplied: number
  /** Trần đã áp cho BHTN (bội số × lương tối thiểu vùng). */
  unemploymentCapApplied: number
}

export type PayrollInput = {
  /** Số tiền người dùng nhập (gross hoặc net tuỳ chiều tính). */
  amount: number
  dependents: number
  region: RegionCode
  /**
   * Lương đóng bảo hiểm nếu khác lương chính (một số công ty đóng trên mức thấp hơn).
   * null/undefined = đóng trên đúng lương gross.
   */
  insuranceBase?: number | null
}

/**
 * Làm sạch số đầu vào: rỗng, chữ, NaN, Infinity, âm → 0 (contract §4).
 * Không ném lỗi — hàm này chạy trên mỗi lần gõ phím của người dùng.
 */
export function sanitizeAmount(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n) || n < 0) return 0
  return n
}

/** Số người phụ thuộc: nguyên, không âm. */
export function sanitizeDependents(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n) || n < 0) return 0
  return Math.floor(n)
}

/** Làm tròn về đồng — tiền Việt không có đơn vị nhỏ hơn 1 đồng. */
const roundVnd = (value: number): number => Math.round(value)

/**
 * Trần đóng BHTN của một vùng = `unemploymentCapMultiplier` × lương tối thiểu vùng.
 * Vùng không có trong config → không áp trần (Infinity) thay vì áp trần 0, vì trần 0
 * nghĩa là "không ai đóng BHTN", sai lệch âm thầm nguy hiểm hơn.
 */
export function unemploymentCap(config: PayrollConfig, region: RegionCode): number {
  const found = findRegion(config, region)
  if (!found) return Number.POSITIVE_INFINITY
  return config.unemploymentCapMultiplier * found.minWage
}

/**
 * Thuế TNCN lũy tiến từng phần trên `taxableIncome`.
 *
 * Giả định về thứ tự bậc: `config.taxBrackets` đã tăng dần theo `upTo`, bậc `upTo: null`
 * ở cuối — normalizePayrollConfig() bảo đảm điều này, và global validate chặn ở admin.
 * Ở đây vẫn tự phòng: bậc có `upTo` ≤ cận dưới đang xét thì bỏ qua, không sinh số âm.
 *
 * Thu nhập tính thuế ≤ 0 → thuế = 0, không ra số âm (contract §4).
 */
export function calculateTax(
  taxableIncome: number,
  brackets: TaxBracket[],
): { tax: number; applied: AppliedBracket[] } {
  const applied: AppliedBracket[] = []
  if (!Number.isFinite(taxableIncome) || taxableIncome <= 0 || brackets.length === 0) {
    return { tax: 0, applied }
  }

  let tax = 0
  let lower = 0
  let order = 0

  for (const bracket of brackets) {
    if (lower >= taxableIncome) break

    const upper = bracket.upTo === null ? Number.POSITIVE_INFINITY : bracket.upTo
    // Bậc nằm hoàn toàn dưới mốc đang xét (dữ liệu xếp sai) → bỏ qua, đừng trừ ngược.
    if (upper <= lower) continue

    const top = Math.min(upper, taxableIncome)
    const taxableInBracket = top - lower
    const bracketTax = (taxableInBracket * bracket.rate) / 100

    order += 1
    tax += bracketTax
    applied.push({
      order,
      from: lower,
      to: bracket.upTo,
      rate: bracket.rate,
      taxableInBracket: roundVnd(taxableInBracket),
      tax: roundVnd(bracketTax),
    })

    lower = top
  }

  return { tax: roundVnd(tax), applied }
}

/**
 * Gross → Net (contract §3.2).
 *
 * Thứ tự bắt buộc:
 *   Thu nhập chịu thuế = Gross − (BHXH + BHYT + BHTN)
 *   Thu nhập tính thuế = trên đó − giảm trừ bản thân − (số phụ thuộc × giảm trừ phụ thuộc)
 *   Thuế = lũy tiến từng phần, âm hoặc 0 → 0
 *   Net  = Gross − bảo hiểm − thuế
 *
 * Trần bảo hiểm: BHXH/BHYT dùng `config.insuranceCap`; BHTN dùng trần RIÊNG theo vùng.
 * Vượt trần thì khoản đóng DỪNG ở trần, không tăng tiếp (contract §4 — bug kinh điển).
 */
export function grossToNet(input: PayrollInput, config: PayrollConfig): PayrollBreakdown {
  const gross = sanitizeAmount(input.amount)
  const dependents = sanitizeDependents(input.dependents)

  // Lương đóng bảo hiểm: mặc định = gross. Người dùng khai riêng thì dùng số đó
  // (contract §3.1 — một số công ty đóng trên mức thấp hơn lương chính).
  const declaredBase =
    input.insuranceBase === null || input.insuranceBase === undefined
      ? gross
      : sanitizeAmount(input.insuranceBase)

  const socialCap = config.insuranceCap
  const unempCap = unemploymentCap(config, input.region)

  const socialBase = Math.min(declaredBase, socialCap)
  const unempBase = Math.min(declaredBase, unempCap)

  const socialInsurance = roundVnd((socialBase * config.insuranceRates.social) / 100)
  const healthInsurance = roundVnd((socialBase * config.insuranceRates.health) / 100)
  const unemploymentInsurance = roundVnd((unempBase * config.insuranceRates.unemployment) / 100)
  const totalInsurance = socialInsurance + healthInsurance + unemploymentInsurance

  const incomeBeforeTax = gross - totalInsurance

  const personalDeduction = config.personalDeduction
  const dependentDeductionTotal = dependents * config.dependentDeduction
  const totalDeduction = personalDeduction + dependentDeductionTotal

  // Thu nhập tính thuế âm → 0, không để lọt số âm xuống calculateTax.
  const taxableIncome = Math.max(0, incomeBeforeTax - totalDeduction)

  const { tax, applied } = calculateTax(taxableIncome, config.taxBrackets)

  return {
    gross,
    insuranceBase: declaredBase,
    socialInsurance,
    healthInsurance,
    unemploymentInsurance,
    totalInsurance,
    incomeBeforeTax,
    totalDeduction,
    personalDeduction,
    dependentDeductionTotal,
    taxableIncome,
    personalIncomeTax: tax,
    appliedBrackets: applied,
    net: gross - totalInsurance - tax,
    socialCapApplied: socialCap,
    unemploymentCapApplied: unempCap,
  }
}

/** Số vòng lặp tối đa của binary search — chặn treo trình duyệt (contract §3.3). */
const MAX_ITERATIONS = 100

/**
 * Net → Gross (contract §3.3).
 *
 * Thuế lũy tiến không có công thức đóng kín ⇒ TÌM KIẾM NHỊ PHÂN trên gross sao cho
 * grossToNet(gross) ≈ net, sai số ≤ 1 đồng, tối đa 100 vòng.
 * CẤM vòng lặp tăng dần 1 đồng — với lương tỷ đồng là treo tab.
 *
 * `grossToNet` đơn điệu không giảm theo gross (thuế suất < 100%), nên nhị phân đúng.
 *
 * Cận trên: nhân đôi từ `net` cho tới khi net(gross) ≥ net mục tiêu, tối đa 100 lần —
 * không đoán một hằng "đủ lớn", vì bảng thuế do khách sửa được, thuế suất có thể rất cao.
 *
 * ⚠️ Lưu ý về `insuranceBase`: khi người dùng khai mức đóng bảo hiểm RIÊNG, mức đó là
 * số cố định không phụ thuộc gross, nên nhị phân vẫn đúng — nó được giữ nguyên qua
 * mọi lần thử.
 */
export function netToGross(input: PayrollInput, config: PayrollConfig): PayrollBreakdown {
  const targetNet = sanitizeAmount(input.amount)
  const withGross = (gross: number) => grossToNet({ ...input, amount: gross }, config)

  if (targetNet <= 0) return withGross(0)

  let low = 0
  let high = Math.max(targetNet, 1)

  // Nới cận trên tới khi phủ được targetNet.
  let expands = 0
  while (withGross(high).net < targetNet && expands < MAX_ITERATIONS) {
    low = high
    high *= 2
    expands++
  }

  // Không phủ nổi (vd thuế suất 100% ở mọi bậc) → trả về kết quả tại cận trên đã thử,
  // thay vì lặp vô hạn hoặc ném lỗi làm trắng trang.
  if (withGross(high).net < targetNet) return withGross(high)

  let best = withGross(high)
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const mid = (low + high) / 2
    const result = withGross(mid)
    const diff = result.net - targetNet

    if (Math.abs(diff) <= 1) {
      best = result
      break
    }
    if (diff > 0) {
      high = mid
      best = result
    } else {
      low = mid
    }
    // Khoảng đã hẹp hơn 1 đồng mà vẫn chưa khớp → dừng, lấy cận trên (không trả
    // thiếu tiền cho người lao động).
    if (high - low < 1) {
      best = withGross(high)
      break
    }
  }

  /**
   * Chốt về gross NGUYÊN ĐỒNG: người dùng không thoả thuận lương lẻ xu, và bảng
   * bóc tách phải nhất quán với con số gross hiển thị.
   *
   * Vì sao phải dò quanh chứ không chỉ làm tròn: nhị phân dừng khi |net − mục tiêu|
   * ≤ 1 đồng, nên nó có thể dừng ở một gross lệch vài đồng so với nghiệm nguyên đẹp
   * (đo được: net 26.215.000 ra gross 29.999.999 thay vì 30.000.000). Quét một dải
   * hẹp ±2 đồng quanh nghiệm và chọn gross NHỎ NHẤT có sai số nhỏ nhất — nhỏ nhất
   * để không báo cho người lao động một mức gross cao hơn mức thật sự cần.
   */
  const center = roundVnd(best.gross)
  let bestGross = center
  let bestDiff = Number.POSITIVE_INFINITY

  for (let candidate = Math.max(0, center - 2); candidate <= center + 2; candidate++) {
    const diff = Math.abs(withGross(candidate).net - targetNet)
    if (diff < bestDiff) {
      bestDiff = diff
      bestGross = candidate
    }
  }

  return withGross(bestGross)
}

export type Direction = 'grossToNet' | 'netToGross'

/** Cửa vào duy nhất cho UI: chọn chiều tính rồi trả cùng một kiểu kết quả. */
export function calculatePayroll(
  direction: Direction,
  input: PayrollInput,
  config: PayrollConfig,
): PayrollBreakdown {
  return direction === 'netToGross' ? netToGross(input, config) : grossToNet(input, config)
}

/**
 * Định dạng tiền Việt: dấu chấm phân cách nghìn, hậu tố " đ" (contract §3.4).
 * Số rác → "0 đ", không bao giờ để chữ NaN lọt ra màn hình.
 */
export function formatVnd(value: number): string {
  const n = Number.isFinite(value) ? Math.round(value) : 0
  return `${n.toLocaleString('vi-VN')} đ`
}
