import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { parseDependentsInput, parseVndInput } from './parseInput'
import { sanitizeAmount } from './calc'

/**
 * Test cho TẦNG INPUT (contract F3 §2). File này CHỈ THÊM — `calc.test.ts` và
 * 60 test trong đó không bị đụng tới một dòng.
 */

describe('parseVndInput — định dạng số Việt Nam (P0-2)', () => {
  it('hiểu đủ 5 cách viết ba mươi triệu mà contract §2 liệt kê', () => {
    assert.equal(parseVndInput('30.000.000'), 30000000)
    assert.equal(parseVndInput('30,000,000'), 30000000)
    assert.equal(parseVndInput('30 000 000'), 30000000)
    assert.equal(parseVndInput('30000000'), 30000000)
    assert.equal(parseVndInput('30.000.000 đ'), 30000000)
  })

  it('hiểu đúng chuỗi mà chính trang này in ra qua formatVnd', () => {
    // formatVnd(26215000) → "26.215.000 đ" — dán ngược lại phải ra đúng số cũ.
    assert.equal(parseVndInput('26.215.000 đ'), 26215000)
    assert.equal(parseVndInput('34.698.945 đ'), 34698945)
  })

  it('bỏ được đơn vị tiền ở đuôi, mọi kiểu viết', () => {
    assert.equal(parseVndInput('30000000đ'), 30000000)
    assert.equal(parseVndInput('30000000 VND'), 30000000)
    assert.equal(parseVndInput('30000000 vnđ'), 30000000)
    assert.equal(parseVndInput('30.000.000  đ'), 30000000)
  })

  it('hiểu khoảng trắng hẹp (U+202F/U+00A0) mà Excel và Intl hay chèn', () => {
    assert.equal(parseVndInput('30 000 000'), 30000000)
    assert.equal(parseVndInput('30 000 000'), 30000000)
  })

  // ── BẪY `30.5` (contract §2) ────────────────────────────────────────────────
  it('BẪY 30.5: dấu chấm KHÔNG bị bỏ mù quáng — 30.5 là 30,5 chứ không phải 305', () => {
    assert.equal(parseVndInput('30.5'), 30.5)
    assert.notEqual(parseVndInput('30.5'), 305)
    assert.equal(parseVndInput('30,5'), 30.5)
  })

  it('quy tắc: dấu chỉ là phân tách nghìn khi nhóm sau nó có ĐÚNG 3 chữ số', () => {
    assert.equal(parseVndInput('30.50'), 30.5) // 2 chữ số → thập phân
    assert.equal(parseVndInput('30.500'), 30500) // 3 chữ số → phân tách nghìn
    assert.equal(parseVndInput('1.234'), 1234) // 3 chữ số → phân tách nghìn
    assert.equal(parseVndInput('1.23'), 1.23) // 2 chữ số → thập phân
    assert.equal(parseVndInput('1.2345'), null) // 4 chữ số → không hiểu được
  })

  it('số hỗn hợp nhóm nghìn + thập phân vẫn đúng khi hai dấu KHÁC nhau', () => {
    assert.equal(parseVndInput('1.234.567,89'), 1234567.89)
    assert.equal(parseVndInput('1,234,567.89'), 1234567.89)
    assert.equal(parseVndInput('1234567.89'), 1234567.89)
  })

  it('cùng một dấu vừa làm phân tách vừa làm thập phân → null, không đoán', () => {
    assert.equal(parseVndInput('30.000.00'), null)
    assert.equal(parseVndInput('1.234.56'), null)
    assert.equal(parseVndInput('30,000,00'), null)
  })

  it('trộn dấu . và , lung tung → null', () => {
    assert.equal(parseVndInput('30.000,000'), null)
    assert.equal(parseVndInput('30,000.000'), null)
  })

  it('chuỗi vô nghĩa trả null — KHÔNG trả 0 (điểm khác sanitizeAmount)', () => {
    assert.equal(parseVndInput('abc'), null)
    assert.equal(parseVndInput('abcxyz'), null)
    assert.equal(parseVndInput('--'), null)
    assert.equal(parseVndInput('...'), null)
    assert.equal(parseVndInput('30..000'), null)
    assert.equal(parseVndInput('30.000.00'), null) // nhóm cuối 2 chữ số + đầu đủ → không hiểu
    assert.equal(parseVndInput('1e9'), null) // ký hiệu khoa học không phải cách người Việt gõ tiền
  })

  it('ô trống / chỉ khoảng trắng trả null (component phân biệt với "gõ bậy")', () => {
    assert.equal(parseVndInput(''), null)
    assert.equal(parseVndInput('   '), null)
    assert.equal(parseVndInput(' '), null)
  })

  it('số âm parse được thành số âm, không bị nuốt thành 0', () => {
    assert.equal(parseVndInput('-5000000'), -5000000)
    assert.equal(parseVndInput('-5.000.000'), -5000000)
    assert.equal(parseVndInput('+30.000.000'), 30000000)
  })

  it('số 0 vẫn là số hợp lệ, khác hẳn null', () => {
    assert.equal(parseVndInput('0'), 0)
    assert.notEqual(parseVndInput('0'), null)
  })

  it('số rất lớn vẫn parse được, không Infinity', () => {
    assert.equal(parseVndInput('10.000.000.000'), 10000000000)
    assert.equal(Number.isFinite(parseVndInput('999.999.999.999') as number), true)
  })

  // ── Ranh giới với tầng tính: hai hàm phải khác nhau đúng chỗ ────────────────
  it('KHÔNG thay thế sanitizeAmount: tầng tính vẫn giữ hợp đồng "rác → 0"', () => {
    // Đây là bằng chứng hai tầng tách bạch, và là lý do 60 test cũ không phải đổi.
    assert.equal(sanitizeAmount('abc'), 0)
    assert.equal(sanitizeAmount(''), 0)
    assert.equal(sanitizeAmount(null), 0)
    // Tầng input thì phân biệt được, tầng tính thì không — đúng thiết kế.
    assert.equal(parseVndInput('abc'), null)
    assert.equal(parseVndInput(''), null)
  })

  it('chuỗi parse được rồi đưa qua sanitizeAmount cho ra đúng số dùng để tính', () => {
    assert.equal(sanitizeAmount(parseVndInput('30.000.000')), 30000000)
    assert.equal(sanitizeAmount(parseVndInput('30 000 000')), 30000000)
  })
})

describe('parseDependentsInput — ô số người phụ thuộc (P1-2)', () => {
  it('số nguyên hợp lệ', () => {
    assert.deepEqual(parseDependentsInput('0'), { kind: 'ok', value: 0, rounded: false })
    assert.deepEqual(parseDependentsInput('2'), { kind: 'ok', value: 2, rounded: false })
    assert.deepEqual(parseDependentsInput('10'), { kind: 'ok', value: 10, rounded: false })
  })

  it('rác và số âm là INVALID, không âm thầm thành 0 (đây là lỗi P1-2)', () => {
    assert.deepEqual(parseDependentsInput('abc'), { kind: 'invalid' })
    assert.deepEqual(parseDependentsInput('-1'), { kind: 'invalid' })
    assert.deepEqual(parseDependentsInput('-'), { kind: 'invalid' })
    assert.deepEqual(parseDependentsInput('2 con'), { kind: 'invalid' })
  })

  it('ô trống tách riêng khỏi "gõ bậy"', () => {
    assert.deepEqual(parseDependentsInput(''), { kind: 'empty' })
    assert.deepEqual(parseDependentsInput('  '), { kind: 'empty' })
  })

  it('2.7 làm tròn xuống 2 nhưng ĐÁNH DẤU rounded để component hiện số thật sự dùng', () => {
    assert.deepEqual(parseDependentsInput('2.7'), { kind: 'ok', value: 2, rounded: true })
    assert.deepEqual(parseDependentsInput('2,7'), { kind: 'ok', value: 2, rounded: true })
    assert.deepEqual(parseDependentsInput('0.9'), { kind: 'ok', value: 0, rounded: true })
  })

  it('khớp với sanitizeDependents ở các ca hợp lệ (không đổi hành vi tính)', () => {
    for (const s of ['0', '1', '2', '5', '2.7']) {
      const parsed = parseDependentsInput(s)
      assert.equal(parsed.kind, 'ok')
      if (parsed.kind === 'ok') {
        assert.equal(parsed.value, Math.floor(Number(s)))
      }
    }
  })
})
