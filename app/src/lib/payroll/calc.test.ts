/**
 * Test cho phần TÍNH của công cụ lương (contract W5 §7, đủ 8 ca bắt buộc).
 *
 * Chạy: `npm run test:payroll` (node --test + tsx, không cài framework mới).
 *
 * Mọi con số kỳ vọng dưới đây được TÍNH TAY từ số liệu contract §2 và ghi rõ từng
 * bước trong comment — không copy từ output của chính code, vì như vậy test chỉ
 * xác nhận code khớp với chính nó.
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  DEFAULT_PAYROLL_CONFIG,
  normalizePayrollConfig,
  type PayrollConfig,
} from './config'
import { calculatePayroll, grossToNet, netToGross, sanitizeAmount } from './calc'

const CONFIG = DEFAULT_PAYROLL_CONFIG

/** Đầu vào mặc định: Vùng I, không người phụ thuộc, đóng bảo hiểm trên đúng lương. */
const input = (amount: number, dependents = 0) =>
  ({ amount, dependents, region: 'I' as const, insuranceBase: null })

describe('Ca 1 — Gross → Net, lương thường 30 triệu, 0 người phụ thuộc', () => {
  /**
   * Tính tay:
   *   Gross = 30.000.000 (dưới trần BHXH/BHYT 46.800.000 và trần BHTN 106.200.000)
   *   BHXH  8%   = 2.400.000
   *   BHYT  1,5% =   450.000
   *   BHTN  1%   =   300.000
   *   Tổng bảo hiểm = 3.150.000
   *   Thu nhập trước thuế = 30.000.000 − 3.150.000 = 26.850.000
   *   Giảm trừ bản thân   = 15.500.000
   *   Thu nhập tính thuế  = 26.850.000 − 15.500.000 = 11.350.000
   *   Thuế bậc 1 (đến 10tr, 5%)          = 10.000.000 × 5%  = 500.000
   *   Thuế bậc 2 (10tr→30tr, 10%): còn 1.350.000 × 10%       = 135.000
   *   Thuế TNCN = 635.000
   *   Net = 30.000.000 − 3.150.000 − 635.000 = 26.215.000
   */
  const r = grossToNet(input(30_000_000), CONFIG)

  it('bảo hiểm đúng từng khoản', () => {
    assert.equal(r.socialInsurance, 2_400_000)
    assert.equal(r.healthInsurance, 450_000)
    assert.equal(r.unemploymentInsurance, 300_000)
    assert.equal(r.totalInsurance, 3_150_000)
  })

  it('thu nhập tính thuế và thuế đúng', () => {
    assert.equal(r.incomeBeforeTax, 26_850_000)
    assert.equal(r.taxableIncome, 11_350_000)
    assert.equal(r.personalIncomeTax, 635_000)
  })

  it('net đúng', () => {
    assert.equal(r.net, 26_215_000)
  })

  it('bóc tách đúng 2 bậc thuế, cộng lại bằng tổng thuế', () => {
    assert.equal(r.appliedBrackets.length, 2)
    assert.equal(r.appliedBrackets[0].tax, 500_000)
    assert.equal(r.appliedBrackets[1].tax, 135_000)
    const sum = r.appliedBrackets.reduce((acc, b) => acc + b.tax, 0)
    assert.equal(sum, r.personalIncomeTax)
  })
})

describe('Ca 2 — Gross → Net có 2 người phụ thuộc', () => {
  /**
   * Tính tay: Gross 30.000.000, 2 người phụ thuộc.
   *   Bảo hiểm giống ca 1 = 3.150.000 → thu nhập trước thuế = 26.850.000
   *   Giảm trừ = 15.500.000 + 2 × 6.200.000 = 27.900.000
   *   Thu nhập tính thuế = 26.850.000 − 27.900.000 = −1.050.000 → 0
   *   Thuế = 0
   *   Net = 30.000.000 − 3.150.000 = 26.850.000
   */
  const r = grossToNet(input(30_000_000, 2), CONFIG)

  it('giảm trừ cộng đúng phần phụ thuộc', () => {
    assert.equal(r.dependentDeductionTotal, 12_400_000)
    assert.equal(r.totalDeduction, 27_900_000)
  })

  it('miễn thuế và net cao hơn ca không phụ thuộc', () => {
    assert.equal(r.taxableIncome, 0)
    assert.equal(r.personalIncomeTax, 0)
    assert.equal(r.net, 26_850_000)
    assert.ok(r.net > grossToNet(input(30_000_000), CONFIG).net)
  })
})

describe('Ca 3 — vượt trần bảo hiểm, khoản đóng phải DỪNG ở trần', () => {
  /**
   * Gross = 200.000.000, Vùng I.
   *   Trần BHXH/BHYT = 46.800.000 → BHXH 8% = 3.744.000 · BHYT 1,5% = 702.000
   *   Trần BHTN = 20 × 5.310.000 = 106.200.000 → BHTN 1% = 1.062.000
   *   Tổng bảo hiểm = 5.508.000  (KHÔNG phải 10,5% của 200 triệu = 21.000.000)
   *   Thu nhập trước thuế = 200.000.000 − 5.508.000 = 194.492.000
   *   Thu nhập tính thuế  = 194.492.000 − 15.500.000 = 178.992.000
   *   Thuế lũy tiến:
   *     bậc 1: 10.000.000 × 5%  =    500.000
   *     bậc 2: 20.000.000 × 10% =  2.000.000
   *     bậc 3: 30.000.000 × 20% =  6.000.000
   *     bậc 4: 40.000.000 × 30% = 12.000.000
   *     bậc 5: 78.992.000 × 35% = 27.647.200
   *     tổng                    = 48.147.200
   *   Net = 200.000.000 − 5.508.000 − 48.147.200 = 146.344.800
   */
  const r = grossToNet(input(200_000_000), CONFIG)

  it('BHXH/BHYT dừng ở trần 46.800.000', () => {
    assert.equal(r.socialInsurance, 3_744_000)
    assert.equal(r.healthInsurance, 702_000)
  })

  it('BHTN dừng ở trần riêng theo vùng (20 × lương tối thiểu vùng I)', () => {
    assert.equal(r.unemploymentCapApplied, 106_200_000)
    assert.equal(r.unemploymentInsurance, 1_062_000)
  })

  it('tổng bảo hiểm không tăng theo lương nữa', () => {
    assert.equal(r.totalInsurance, 5_508_000)
    // Lương gấp đôi → bảo hiểm KHÔNG đổi, vì cả hai đều đã trên trần.
    const bigger = grossToNet(input(400_000_000), CONFIG)
    assert.equal(bigger.totalInsurance, r.totalInsurance)
  })

  it('thuế và net đúng số tính tay', () => {
    assert.equal(r.personalIncomeTax, 48_147_200)
    assert.equal(r.net, 146_344_800)
  })

  it('trần BHTN đổi theo vùng: vùng IV thấp hơn vùng I', () => {
    // Vùng IV: trần BHTN = 20 × 3.700.000 = 74.000.000 → BHTN = 740.000
    const r4 = grossToNet({ ...input(200_000_000), region: 'IV' }, CONFIG)
    assert.equal(r4.unemploymentCapApplied, 74_000_000)
    assert.equal(r4.unemploymentInsurance, 740_000)
  })

  it('số rất lớn (10 tỷ) không tràn, không NaN', () => {
    const huge = grossToNet(input(10_000_000_000), CONFIG)
    assert.ok(Number.isFinite(huge.net))
    assert.ok(Number.isFinite(huge.personalIncomeTax))
    assert.equal(huge.totalInsurance, 5_508_000)
  })
})

describe('Ca 4 — lương thấp, thu nhập tính thuế âm → thuế = 0', () => {
  /**
   * Gross = 8.000.000.
   *   Bảo hiểm 10,5% = 840.000 (dưới mọi trần)
   *   Thu nhập trước thuế = 7.160.000
   *   Thu nhập tính thuế  = 7.160.000 − 15.500.000 = −8.340.000 → kẹp về 0
   *   Thuế = 0 · Net = 8.000.000 − 840.000 = 7.160.000
   */
  const r = grossToNet(input(8_000_000), CONFIG)

  it('không ra thuế âm, không ra thu nhập tính thuế âm', () => {
    assert.equal(r.taxableIncome, 0)
    assert.equal(r.personalIncomeTax, 0)
    assert.equal(r.appliedBrackets.length, 0)
  })

  it('vẫn tính được lương dưới mức đóng bảo hiểm tối thiểu, không chặn', () => {
    assert.equal(r.totalInsurance, 840_000)
    assert.equal(r.net, 7_160_000)
    // Lương 1 triệu (dưới lương tối thiểu vùng) vẫn ra kết quả, không ném lỗi.
    const tiny = grossToNet(input(1_000_000), CONFIG)
    assert.equal(tiny.personalIncomeTax, 0)
    assert.equal(tiny.net, 1_000_000 - 105_000)
  })
})

describe('Ca 5 — Net → Gross → Net khứ hồi, sai số ≤ 1 đồng', () => {
  const NETS = [7_160_000, 20_000_000, 26_215_000, 50_000_000, 146_344_800]

  for (const net of NETS) {
    it(`khứ hồi đúng với net = ${net.toLocaleString('vi-VN')}`, () => {
      const gross = netToGross(input(net), CONFIG)
      const back = grossToNet(input(gross.gross), CONFIG)
      assert.ok(
        Math.abs(back.net - net) <= 1,
        `net mục tiêu ${net}, quay lại ra ${back.net} (lệch ${back.net - net})`,
      )
    })
  }

  it('khứ hồi đúng cả khi có người phụ thuộc', () => {
    const gross = netToGross(input(40_000_000, 3), CONFIG)
    const back = grossToNet(input(gross.gross, 3), CONFIG)
    assert.ok(Math.abs(back.net - 40_000_000) <= 1)
  })

  it('Net 26.215.000 suy ra đúng Gross 30.000.000 của ca 1', () => {
    const gross = netToGross(input(26_215_000), CONFIG)
    assert.equal(gross.gross, 30_000_000)
  })

  it('không treo với số rất lớn — trả kết quả hữu hạn', () => {
    const gross = netToGross(input(5_000_000_000), CONFIG)
    assert.ok(Number.isFinite(gross.gross))
    const back = grossToNet(input(gross.gross), CONFIG)
    assert.ok(Math.abs(back.net - 5_000_000_000) <= 1)
  })
})

describe('Ca 6 — đầu vào rác: 0, âm, rỗng, chữ → không NaN, không crash', () => {
  const GARBAGE: unknown[] = [0, -1, -5_000_000, '', '   ', 'abc', NaN, Infinity, -Infinity, null, undefined]

  it('sanitizeAmount đưa mọi rác về 0', () => {
    for (const value of GARBAGE) {
      assert.equal(sanitizeAmount(value), 0, `sanitizeAmount(${String(value)}) phải là 0`)
    }
  })

  for (const value of GARBAGE) {
    it(`grossToNet với amount = ${String(value)} ra số hữu hạn`, () => {
      const r = grossToNet({ ...input(0), amount: value as number }, CONFIG)
      for (const [key, num] of Object.entries(r)) {
        if (typeof num === 'number') {
          assert.ok(Number.isFinite(num), `field ${key} không hữu hạn: ${num}`)
        }
      }
      assert.equal(r.gross, 0)
      assert.equal(r.personalIncomeTax, 0)
      assert.equal(r.net, 0)
    })
  }

  it('số người phụ thuộc âm / lẻ / rác không làm hỏng giảm trừ', () => {
    assert.equal(grossToNet({ ...input(30_000_000), dependents: -3 }, CONFIG).dependentDeductionTotal, 0)
    assert.equal(
      grossToNet({ ...input(30_000_000), dependents: 2.9 }, CONFIG).dependentDeductionTotal,
      12_400_000,
    )
    const junk = grossToNet(
      { ...input(30_000_000), dependents: 'hai' as unknown as number },
      CONFIG,
    )
    assert.equal(junk.dependentDeductionTotal, 0)
    assert.ok(Number.isFinite(junk.net))
  })

  it('netToGross với đầu vào rác trả về 0, không lặp vô hạn', () => {
    for (const value of GARBAGE) {
      const r = netToGross({ ...input(0), amount: value as number }, CONFIG)
      assert.equal(r.gross, 0)
      assert.ok(Number.isFinite(r.net))
    }
  })

  it('vùng không có trong config → không áp trần BHTN bằng 0', () => {
    const r = grossToNet({ ...input(200_000_000), region: 'IX' as never }, CONFIG)
    // Không tìm thấy vùng → không áp trần (Infinity), BHTN = 1% của cả lương.
    assert.equal(r.unemploymentInsurance, 2_000_000)
    assert.ok(Number.isFinite(r.net))
  })
})

describe('Ca 7 — đổi config thì kết quả đổi tương ứng', () => {
  it('giảm trừ bản thân cao hơn → thuế thấp hơn đúng bằng phần chênh', () => {
    /**
     * Config B: giảm trừ bản thân 20.000.000 (thay vì 15.500.000), giữ nguyên phần còn lại.
     * Ca 1: thu nhập trước thuế 26.850.000.
     *   Thu nhập tính thuế = 26.850.000 − 20.000.000 = 6.850.000
     *   Thuế = 6.850.000 × 5% = 342.500  (chỉ chạm bậc 1)
     *   Net  = 30.000.000 − 3.150.000 − 342.500 = 26.507.500
     */
    const configB: PayrollConfig = { ...CONFIG, personalDeduction: 20_000_000 }
    const r = grossToNet(input(30_000_000), configB)
    assert.equal(r.taxableIncome, 6_850_000)
    assert.equal(r.personalIncomeTax, 342_500)
    assert.equal(r.net, 26_507_500)
    assert.ok(r.net > grossToNet(input(30_000_000), CONFIG).net)
  })

  it('bảng thuế phẳng 1 bậc 10% → thuế đúng 10% thu nhập tính thuế', () => {
    /**
     * Thu nhập tính thuế ca 1 = 11.350.000 → thuế = 1.135.000
     * Net = 30.000.000 − 3.150.000 − 1.135.000 = 25.715.000
     */
    const flat: PayrollConfig = { ...CONFIG, taxBrackets: [{ upTo: null, rate: 10 }] }
    const r = grossToNet(input(30_000_000), flat)
    assert.equal(r.personalIncomeTax, 1_135_000)
    assert.equal(r.net, 25_715_000)
    assert.equal(r.appliedBrackets.length, 1)
  })

  it('đổi trần bảo hiểm sang nguồn B (50.600.000) → bảo hiểm tăng đúng phần chênh', () => {
    /**
     * Gross 200 triệu với trần 50.600.000:
     *   BHXH 8%   = 4.048.000 (thay vì 3.744.000)
     *   BHYT 1,5% =   759.000 (thay vì   702.000)
     */
    const capB: PayrollConfig = { ...CONFIG, insuranceCap: 50_600_000 }
    const r = grossToNet(input(200_000_000), capB)
    assert.equal(r.socialInsurance, 4_048_000)
    assert.equal(r.healthInsurance, 759_000)
  })

  it('đổi tỷ lệ bảo hiểm → khoản trừ đổi theo', () => {
    const rateB: PayrollConfig = {
      ...CONFIG,
      insuranceRates: { social: 10, health: 2, unemployment: 1 },
    }
    const r = grossToNet(input(30_000_000), rateB)
    assert.equal(r.socialInsurance, 3_000_000)
    assert.equal(r.healthInsurance, 600_000)
    assert.equal(r.totalInsurance, 3_900_000)
  })

  it('đổi lương tối thiểu vùng → trần BHTN đổi theo', () => {
    const regionB: PayrollConfig = { ...CONFIG, regions: [{ code: 'I', minWage: 1_000_000 }] }
    const r = grossToNet(input(200_000_000), regionB)
    // Trần BHTN = 20 × 1.000.000 = 20.000.000 → BHTN 1% = 200.000
    assert.equal(r.unemploymentCapApplied, 20_000_000)
    assert.equal(r.unemploymentInsurance, 200_000)
  })
})

describe('Ca 8 — config lỗi/thiếu field → rơi về fallback, không crash, không NaN', () => {
  const BROKEN: unknown[] = [
    null,
    undefined,
    'không phải object',
    42,
    {},
    { taxBrackets: [] },
    { taxBrackets: 'hỏng', regions: null, insuranceRates: 'hỏng' },
    { personalDeduction: -1, dependentDeduction: NaN, insuranceCap: 0 },
    { insuranceRates: { social: 500, health: -2, unemployment: 'x' } },
    { taxBrackets: [{ upTo: 'x', rate: 'y' }, { rate: 200 }, null] },
    { regions: [{ code: 'Z', minWage: 1 }, { code: 'I', minWage: -5 }] },
    { effectiveFrom: '   ', legalBasis: '' },
    { unemploymentCapMultiplier: 0 },
  ]

  for (const raw of BROKEN) {
    it(`normalize(${JSON.stringify(raw) ?? String(raw)}) vẫn cho kết quả tính được`, () => {
      const config = normalizePayrollConfig(raw)

      // Bộ config sau chuẩn hoá phải luôn dùng được: có bậc thuế, có vùng, có mốc luật.
      assert.ok(config.taxBrackets.length > 0)
      assert.ok(config.regions.length > 0)
      assert.ok(config.effectiveFrom.trim() !== '')
      assert.ok(config.legalBasis.trim() !== '')
      assert.ok(config.insuranceCap > 0)
      assert.ok(config.unemploymentCapMultiplier > 0)

      const r = grossToNet(input(30_000_000), config)
      for (const [key, num] of Object.entries(r)) {
        if (typeof num === 'number') {
          assert.ok(Number.isFinite(num), `field ${key} không hữu hạn: ${num}`)
        }
      }
      assert.ok(r.net > 0)
    })
  }

  it('thiếu 1 field thì CHỈ field đó rơi về mặc định, phần khách nhập được giữ', () => {
    // Khách nhập giảm trừ bản thân 20 triệu nhưng xoá sạch bảng thuế.
    const config = normalizePayrollConfig({ personalDeduction: 20_000_000, taxBrackets: [] })
    assert.equal(config.personalDeduction, 20_000_000)
    assert.deepEqual(config.taxBrackets, DEFAULT_PAYROLL_CONFIG.taxBrackets)
    assert.equal(config.dependentDeduction, DEFAULT_PAYROLL_CONFIG.dependentDeduction)
  })

  it('bảng thuế nhập lộn xộn được sắp lại tăng dần, bậc không trần xuống cuối', () => {
    const config = normalizePayrollConfig({
      taxBrackets: [
        { upTo: null, rate: 35 },
        { upTo: 30_000_000, rate: 10 },
        { upTo: 10_000_000, rate: 5 },
      ],
    })
    assert.deepEqual(
      config.taxBrackets.map((b) => b.upTo),
      [10_000_000, 30_000_000, null],
    )
    // Và tính ra đúng số của ca 1 (bậc 1 + bậc 2 trên 11.350.000).
    const r = grossToNet(input(30_000_000), config)
    assert.equal(r.personalIncomeTax, 635_000)
  })
})

describe('Bổ sung — mức lương đóng bảo hiểm khác lương chính (§3.1)', () => {
  it('đóng bảo hiểm trên mức thấp hơn → bảo hiểm giảm, thuế tăng', () => {
    /**
     * Gross 30.000.000 nhưng công ty chỉ đóng bảo hiểm trên 10.000.000.
     *   Bảo hiểm = 10,5% × 10.000.000 = 1.050.000
     *   Thu nhập trước thuế = 28.950.000
     *   Thu nhập tính thuế  = 28.950.000 − 15.500.000 = 13.450.000
     *   Thuế = 10.000.000×5% + 3.450.000×10% = 500.000 + 345.000 = 845.000
     *   Net  = 30.000.000 − 1.050.000 − 845.000 = 28.105.000
     */
    const r = grossToNet({ ...input(30_000_000), insuranceBase: 10_000_000 }, CONFIG)
    assert.equal(r.totalInsurance, 1_050_000)
    assert.equal(r.personalIncomeTax, 845_000)
    assert.equal(r.net, 28_105_000)
  })

  it('khứ hồi vẫn đúng khi khai mức đóng bảo hiểm riêng', () => {
    const gross = netToGross({ ...input(28_105_000), insuranceBase: 10_000_000 }, CONFIG)
    assert.equal(gross.gross, 30_000_000)
  })
})

describe('Bổ sung — calculatePayroll định tuyến đúng chiều', () => {
  it('grossToNet và netToGross khớp với hàm gọi thẳng', () => {
    assert.deepEqual(
      calculatePayroll('grossToNet', input(30_000_000), CONFIG),
      grossToNet(input(30_000_000), CONFIG),
    )
    assert.deepEqual(
      calculatePayroll('netToGross', input(26_215_000), CONFIG),
      netToGross(input(26_215_000), CONFIG),
    )
  })
})
