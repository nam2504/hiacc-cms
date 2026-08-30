/**
 * Parse số người dùng GÕ/DÁN ở tầng input (contract F3 §2).
 *
 * Vì sao là file riêng, không sửa `sanitizeAmount` trong `calc.ts`:
 * `calc.ts` là TẦNG TÍNH. Hợp đồng của nó là "nhận number, rác thì về 0" — hành vi
 * phòng thủ đúng và đang được 60 test khoá. Chỗ hỏng nằm ở TẦNG INPUT: chuỗi người
 * dùng dán vào bị ném thẳng vào `Number()`, nên "30.000.000" (đúng định dạng mà chính
 * trang này in ra qua `formatVnd`) thành `NaN`.
 *
 * Khác biệt then chốt so với `sanitizeAmount`: hàm ở đây trả `null` cho chuỗi thật sự
 * không hiểu được, KHÔNG trả 0 — component cần phân biệt "ô trống" với "gõ bậy" để
 * hiện hai trạng thái khác nhau, thay vì im lặng như trước.
 */

/** Kết quả parse: `null` = không hiểu được chuỗi này. */
export type ParsedNumber = number | null

/**
 * Ký tự bỏ đi trước khi phân tích: đơn vị tiền và mọi loại khoảng trắng.
 * Gồm cả khoảng trắng hẹp U+202F / U+00A0 vì `Intl.NumberFormat` và Excel hay chèn.
 */
const CURRENCY_NOISE = /[đdĐD]$|vnd$|vnđ$/i
const ALL_SPACES = /[\s   ]/g

/**
 * QUY TẮC PHÂN TÁCH NGHÌN (bẫy `30.5` ở contract §2):
 *
 * Dấu `.` hoặc `,` chỉ được coi là phân tách nghìn khi **nhóm chữ số ngay sau nó có
 * đúng 3 chữ số**. Ngược lại nó là dấu thập phân.
 *
 *   "30.000.000" → nhóm sau mỗi dấu = "000" (3 chữ số) → phân tách → 30000000
 *   "30.5"       → nhóm sau dấu = "5"   (1 chữ số) → thập phân  → 30.5
 *   "30.50"      → nhóm sau dấu = "50"  (2 chữ số) → thập phân  → 30.5
 *   "1.234"      → nhóm sau dấu = "234" (3 chữ số) → phân tách → 1234
 *
 * Ca `1.234` nhập nhằng thật (có thể là "một phẩy hai ba tư"). Chọn nghiêng về phân
 * tách nghìn vì đây là ô TIỀN VIỆT: tiền Việt không dùng phần thập phân trong đời
 * thực, còn "1.234" là cách viết một nghìn hai trăm ba tư mà người Việt gõ hằng ngày.
 * Đổi lại, `30.5` — ca nguy hiểm nêu trong contract vì sai gấp 10 lần — được giữ đúng
 * là 30,5 chứ không thành 305.
 *
 * Hai ràng buộc phụ để KHÔNG đoán bừa khi chuỗi đã hỏng:
 *   - phần thập phân chỉ được 1–2 chữ số → `1.2345` trả null thay vì đoán thành 1,2345.
 *   - dấu thập phân phải KHÁC dấu phân tách nghìn → `30.000.00` trả null (không thể vừa
 *     là phân tách vừa là thập phân), còn `1.234.567,89` thì hợp lệ.
 */
function normalizeGrouping(raw: string): string | null {
  // Chỉ chấp nhận chữ số và dấu . , ở thân số (dấu âm xử lý riêng bên ngoài).
  if (!/^[0-9]+([.,][0-9]+)*$/.test(raw)) return null

  const parts = raw.split(/[.,]/)
  if (parts.length === 1) return parts[0]

  // Giữ lại CHÍNH các ký tự ngăn cách, không chỉ vị trí — vì quy tắc dưới đây cần biết
  // dấu thập phân có khác dấu phân tách nghìn hay không.
  const separators = raw.match(/[.,]/g) ?? []
  const head = parts[0]
  const tail = parts.slice(1)

  // Nhóm đầu không được quá 3 chữ số nếu đây là số có phân tách nghìn.
  const allTailAreGroups = tail.every((p) => p.length === 3)

  if (allTailAreGroups && head.length <= 3) {
    // Toàn bộ dấu là phân tách nghìn: 30.000.000 · 1.234 · 12.345.678
    // Yêu cầu mọi dấu phân tách phải GIỐNG NHAU: "30.000,000" là gõ nhầm, không đoán.
    if (new Set(separators).size !== 1) return null
    return head + tail.join('')
  }

  // Tới đây: dấu CUỐI phải là dấu thập phân, các dấu trước nó (nếu có) là phân tách nghìn.
  const decimalPart = tail[tail.length - 1]
  const groupParts = tail.slice(0, -1)
  const decimalSep = separators[separators.length - 1]
  const groupSeps = separators.slice(0, -1)

  // Phần thập phân chỉ chấp nhận 1–2 chữ số. Nhiều hơn thì chuỗi không phải cách viết
  // tiền nào cả (`1.2345`), và đoán bừa ở ô tiền là đúng thứ contract §2 cấm.
  if (decimalPart.length === 0 || decimalPart.length > 2) return null

  // Các nhóm đứng trước dấu thập phân vẫn phải đúng 3 chữ số.
  if (!groupParts.every((p) => p.length === 3)) return null

  // Ràng buộc "nhóm đầu ≤ 3 chữ số" CHỈ áp dụng khi chuỗi thật sự có phân tách nghìn.
  // Số viết liền không nhóm (`1234567.89`) thì phần nguyên dài bao nhiêu cũng hợp lệ.
  if (groupParts.length > 0 && head.length > 3) return null

  // Then chốt cho ca `30.000.00`: nếu có phân tách nghìn thì dấu thập phân BẮT BUỘC
  // phải là ký tự khác, và mọi dấu nhóm phải giống nhau. Cùng một dấu `.` vừa làm
  // phân tách vừa làm thập phân trong một chuỗi là gõ sai — trả null, không đoán.
  if (groupSeps.length > 0) {
    if (new Set(groupSeps).size !== 1) return null
    if (groupSeps[0] === decimalSep) return null
  }

  // "30.5" · "30.50" · "1.234.567,89"
  return `${head}${groupParts.join('')}.${decimalPart}`
}

/**
 * Parse ô TIỀN (VND) người dùng gõ/dán.
 *
 * Hiểu được: `30000000` · `30.000.000` · `30,000,000` · `30 000 000` · `30.000.000 đ`
 * Trả `null` khi: chuỗi rỗng/chỉ khoảng trắng, hoặc thật sự không hiểu được (`abc`, `--`).
 *
 * KHÔNG trả 0 cho rác — đó là điểm khác `sanitizeAmount` và là lý do hàm này tồn tại.
 * Số âm parse ra được (trả số âm) để component tự quyết cách báo lỗi, thay vì bị nuốt
 * thành 0 rồi trông như ô trống.
 */
export function parseVndInput(value: string): ParsedNumber {
  if (typeof value !== 'string') return null

  let s = value.replace(ALL_SPACES, '')
  if (s === '') return null

  // Bỏ đơn vị tiền ở đuôi: "30.000.000đ" · "30000000 VND"
  s = s.replace(CURRENCY_NOISE, '')
  if (s === '') return null

  let sign = 1
  if (s.startsWith('-')) {
    sign = -1
    s = s.slice(1)
  } else if (s.startsWith('+')) {
    s = s.slice(1)
  }
  if (s === '') return null

  const normalized = normalizeGrouping(s)
  if (normalized === null) return null

  const n = Number(normalized)
  if (!Number.isFinite(n)) return null

  return sign * n
}

/**
 * Parse ô SỐ NGƯỜI PHỤ THUỘC (contract F3 §4).
 *
 * Khác ô tiền ở chỗ đây là ĐẾM NGƯỜI: không có phân tách nghìn (không ai có 1.000
 * người phụ thuộc), và số âm là vô nghĩa chứ không chỉ là "ngoài phạm vi".
 *
 * Trả về:
 *   { kind: 'empty' }                     ô trống
 *   { kind: 'invalid' }                   không parse được / âm  → component hiện lỗi
 *   { kind: 'ok', value, rounded }        parse được; `rounded` = có bị làm tròn xuống
 *
 * `2.7` → value 2, rounded true: contract cho phép làm tròn xuống, nhưng bắt buộc phải
 * cho người dùng THẤY con số thật sự được dùng, nên trạng thái này tách riêng.
 */
export type DependentsParse =
  | { kind: 'empty' }
  | { kind: 'invalid' }
  | { kind: 'ok'; value: number; rounded: boolean }

export function parseDependentsInput(value: string): DependentsParse {
  if (typeof value !== 'string') return { kind: 'invalid' }

  const s = value.replace(ALL_SPACES, '')
  if (s === '') return { kind: 'empty' }

  // Chỉ số nguyên hoặc số thập phân đơn giản; dấu âm coi là không hợp lệ ngay tại đây
  // (thay vì để rơi về 0 im lặng như hành vi cũ).
  if (!/^[0-9]+([.,][0-9]+)?$/.test(s)) return { kind: 'invalid' }

  const n = Number(s.replace(',', '.'))
  if (!Number.isFinite(n) || n < 0) return { kind: 'invalid' }

  const floored = Math.floor(n)
  return { kind: 'ok', value: floored, rounded: floored !== n }
}
