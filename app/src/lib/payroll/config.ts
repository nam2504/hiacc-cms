/**
 * Kiểu dữ liệu + giá trị mặc định fallback cho công cụ tính lương (gói W5).
 *
 * ⚠️ VAI TRÒ CỦA FILE NÀY (contract W5 §2.6):
 * File này KHÔNG còn là nguồn sự thật của số liệu luật. Nguồn sự thật là global
 * `payroll-config` trong /admin (src/globals/PayrollConfig.ts) — khách và kế toán
 * sửa được, không cần deploy lại.
 *
 * File này chỉ giữ:
 *   (a) DEFAULT_PAYROLL_CONFIG — fallback dùng khi global lỗi/rỗng, để trang
 *       không bao giờ trắng;
 *   (b) kiểu TypeScript cho hàm tính;
 *   (c) normalizePayrollConfig() — chuẩn hoá dữ liệu thô từ global về kiểu tính toán.
 *
 * Hàm tính lương trong ./calc.ts NHẬN config qua tham số, KHÔNG import hằng ở đây,
 * để test truyền được config cố định (contract §2.6).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * NGUỒN SỐ LIỆU — do PM cấp ở contract W5 §2, KHÔNG tra web, KHÔNG suy luận.
 *   §2.1 Giảm trừ gia cảnh      : Nghị quyết 110/2025/UBTVQH15 (từ kỳ tính thuế 2026)
 *   §2.2 Biểu thuế TNCN 5 bậc   : Luật Thuế TNCN 2025 (Luật 109/2025/QH15), từ 01/01/2026
 *   §2.3 Tỷ lệ BH người lao động: Luật BHXH 2024 (41/2024/QH15), NĐ 158/2025, NĐ 188/2025
 *   §2.4 Lương tối thiểu vùng   : Nghị định 293/2025/NĐ-CP
 *   §2.5 Trần BHXH/BHYT         : CHƯA XÁC MINH — xem INSURANCE_CAP_SOURCE_A/B bên dưới
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Một bậc của biểu thuế lũy tiến. `upTo: null` = bậc cuối, không có trần trên. */
export type TaxBracket = {
  /** Ngưỡng trên của bậc (đồng/tháng), tính trên THU NHẬP TÍNH THUẾ. null = vô hạn. */
  upTo: number | null
  /** Thuế suất, đơn vị phần trăm (5 = 5%). */
  rate: number
}

export type RegionCode = 'I' | 'II' | 'III' | 'IV'

export type Region = {
  code: RegionCode
  /** Lương tối thiểu vùng, đồng/tháng. */
  minWage: number
}

/** Tỷ lệ bảo hiểm NGƯỜI LAO ĐỘNG đóng, đơn vị phần trăm. */
export type InsuranceRates = {
  /** BHXH */
  social: number
  /** BHYT */
  health: number
  /** BHTN */
  unemployment: number
}

export type PayrollConfig = {
  personalDeduction: number
  dependentDeduction: number
  taxBrackets: TaxBracket[]
  insuranceRates: InsuranceRates
  /** Trần thu nhập tính đóng BHXH + BHYT (đồng/tháng). */
  insuranceCap: number
  regions: Region[]
  /** Trần BHTN = bội số này × lương tối thiểu vùng người dùng chọn. */
  unemploymentCapMultiplier: number
  /** Mốc hiệu lực của bộ số này, hiện trên trang cho người dùng đối chiếu. */
  effectiveFrom: string
  /** Căn cứ pháp lý, hiện trên trang. */
  legalBasis: string
}

/**
 * ⚠️ TRẦN ĐÓNG BHXH/BHYT — CÓ MÂU THUẪN NGUỒN, CHƯA XÁC MINH (contract §2.5).
 *
 * PM tra được HAI con số khác nhau và chưa xác minh được cái nào đúng:
 *   - Nguồn A: 20 × mức tham chiếu 2.340.000 đ = 46.800.000 đ/tháng
 *   - Nguồn B: 50.600.000 đ/tháng (từ 01/07/2026)
 *
 * Mặc định dùng NGUỒN A vì căn cứ "20 lần mức tham chiếu" rõ ràng hơn (contract §2.5 mục 2).
 *
 * TODO: PM/kế toán khách xác nhận trần BHXH-BHYT trước khi public.
 */
export const INSURANCE_CAP_SOURCE_A = 46_800_000
/** TODO: PM/kế toán khách xác nhận trần BHXH-BHYT trước khi public. Xem chú thích trên. */
export const INSURANCE_CAP_SOURCE_B = 50_600_000

/**
 * Fallback dùng đúng số contract §2. Chỉ chạy khi global `payroll-config` lỗi/rỗng
 * (DB chưa seed, DB sập) — bình thường trang lấy số từ global.
 */
export const DEFAULT_PAYROLL_CONFIG: PayrollConfig = {
  // §2.1
  personalDeduction: 15_500_000,
  dependentDeduction: 6_200_000,
  // §2.2 — 5 bậc, lũy tiến từng phần
  taxBrackets: [
    { upTo: 10_000_000, rate: 5 },
    { upTo: 30_000_000, rate: 10 },
    { upTo: 60_000_000, rate: 20 },
    { upTo: 100_000_000, rate: 30 },
    { upTo: null, rate: 35 },
  ],
  // §2.3 — chỉ phần NGƯỜI LAO ĐỘNG chịu (tổng 10,5%). Phần doanh nghiệp đóng
  // (21,5%) KHÔNG trừ vào lương, đừng cộng vào đây.
  insuranceRates: { social: 8, health: 1.5, unemployment: 1 },
  // §2.5 — chưa xác minh, xem chú thích INSURANCE_CAP_SOURCE_A
  insuranceCap: INSURANCE_CAP_SOURCE_A,
  // §2.4
  regions: [
    { code: 'I', minWage: 5_310_000 },
    { code: 'II', minWage: 4_730_000 },
    { code: 'III', minWage: 4_140_000 },
    { code: 'IV', minWage: 3_700_000 },
  ],
  // §2.5 — trần BHTN = 20 × lương tối thiểu vùng (căn cứ khác BHXH/BHYT)
  unemploymentCapMultiplier: 20,
  effectiveFrom: '2026-01-01',
  legalBasis: [
    'Giảm trừ gia cảnh: Nghị quyết 110/2025/UBTVQH15 (áp dụng từ kỳ tính thuế 2026).',
    'Biểu thuế thu nhập cá nhân lũy tiến 5 bậc: Luật Thuế thu nhập cá nhân 2025 (Luật 109/2025/QH15), phần thu nhập từ tiền lương hiệu lực 01/01/2026.',
    'Tỷ lệ bảo hiểm người lao động đóng (BHXH 8%, BHYT 1,5%, BHTN 1%): Luật Bảo hiểm xã hội 2024 (số 41/2024/QH15), Nghị định 158/2025/NĐ-CP, Nghị định 188/2025/NĐ-CP.',
    'Lương tối thiểu vùng: Nghị định 293/2025/NĐ-CP.',
  ].join('\n'),
}

/** Số hợp lệ và hữu hạn? Dùng để lọc dữ liệu rác từ global trước khi tính. */
const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

const REGION_CODES: RegionCode[] = ['I', 'II', 'III', 'IV']

/**
 * Chuẩn hoá dữ liệu thô từ global `payroll-config` về `PayrollConfig`.
 *
 * Nguyên tắc: từng field một, field nào hỏng/thiếu thì lấy fallback của RIÊNG field
 * đó — không vứt cả bộ config. Nhờ vậy khách xoá nhầm một ô trong admin thì chỉ ô
 * đó rơi về mặc định, phần còn lại vẫn là số khách đã nhập (contract §7 ca 8).
 *
 * KHÔNG ném lỗi — trang public gọi hàm này, ném lỗi là trang trắng.
 */
export function normalizePayrollConfig(raw: unknown): PayrollConfig {
  const fallback = DEFAULT_PAYROLL_CONFIG
  if (!raw || typeof raw !== 'object') return fallback

  const src = raw as Record<string, unknown>

  const num = (value: unknown, fb: number, { allowZero = true } = {}): number => {
    if (!isFiniteNumber(value)) return fb
    if (value < 0) return fb
    if (!allowZero && value === 0) return fb
    return value
  }

  // Bảng thuế: chỉ nhận bậc có `rate` hợp lệ. Sắp xếp theo `upTo` tăng dần và đẩy
  // bậc `upTo: null` (không trần) xuống cuối — hàm tính giả định thứ tự này.
  const rawBrackets = Array.isArray(src.taxBrackets) ? src.taxBrackets : []
  const brackets: TaxBracket[] = rawBrackets
    .map((row): TaxBracket | null => {
      if (!row || typeof row !== 'object') return null
      const r = row as Record<string, unknown>
      if (!isFiniteNumber(r.rate) || r.rate < 0 || r.rate > 100) return null
      const upTo = isFiniteNumber(r.upTo) && r.upTo > 0 ? r.upTo : null
      return { upTo, rate: r.rate }
    })
    .filter((row): row is TaxBracket => row !== null)
    .sort((a, b) => {
      if (a.upTo === null) return 1
      if (b.upTo === null) return -1
      return a.upTo - b.upTo
    })

  const rawRegions = Array.isArray(src.regions) ? src.regions : []
  const regions: Region[] = rawRegions
    .map((row): Region | null => {
      if (!row || typeof row !== 'object') return null
      const r = row as Record<string, unknown>
      const code = r.code as RegionCode
      if (!REGION_CODES.includes(code)) return null
      if (!isFiniteNumber(r.minWage) || r.minWage < 0) return null
      return { code, minWage: r.minWage }
    })
    .filter((row): row is Region => row !== null)

  const rawRates = (src.insuranceRates ?? {}) as Record<string, unknown>
  const rate = (value: unknown, fb: number): number =>
    isFiniteNumber(value) && value >= 0 && value <= 100 ? value : fb

  const effectiveFrom =
    typeof src.effectiveFrom === 'string' && src.effectiveFrom.trim() !== ''
      ? src.effectiveFrom.trim()
      : fallback.effectiveFrom

  const legalBasis =
    typeof src.legalBasis === 'string' && src.legalBasis.trim() !== ''
      ? src.legalBasis.trim()
      : fallback.legalBasis

  return {
    personalDeduction: num(src.personalDeduction, fallback.personalDeduction),
    dependentDeduction: num(src.dependentDeduction, fallback.dependentDeduction),
    // Bảng thuế rỗng → fallback: không có bậc nào thì thuế luôn = 0, tức là tính SAI
    // âm thầm. Thà rơi về biểu §2.2 còn hơn ra số 0 trông như hợp lệ.
    taxBrackets: brackets.length > 0 ? brackets : fallback.taxBrackets,
    insuranceRates: {
      social: rate(rawRates.social, fallback.insuranceRates.social),
      health: rate(rawRates.health, fallback.insuranceRates.health),
      unemployment: rate(rawRates.unemployment, fallback.insuranceRates.unemployment),
    },
    // Trần = 0 vô nghĩa (không ai đóng bảo hiểm) → coi là chưa nhập, lấy fallback.
    insuranceCap: num(src.insuranceCap, fallback.insuranceCap, { allowZero: false }),
    regions: regions.length > 0 ? regions : fallback.regions,
    unemploymentCapMultiplier: num(
      src.unemploymentCapMultiplier,
      fallback.unemploymentCapMultiplier,
      { allowZero: false },
    ),
    effectiveFrom,
    legalBasis,
  }
}

/** Tra lương tối thiểu của một vùng trong config; không có vùng đó thì trả null. */
export function findRegion(config: PayrollConfig, code: RegionCode): Region | null {
  return config.regions.find((r) => r.code === code) ?? null
}
