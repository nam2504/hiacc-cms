'use server'

import { headers } from 'next/headers'
import { getPayloadClient } from '@/lib/site'

/**
 * Server Action nhận form liên hệ của trang /lien-he (gói W7).
 *
 * Ghi DB bằng Payload Local API với quyền server (`overrideAccess: true`) —
 * form public KHÔNG gọi REST /api từ browser, nên không lộ endpoint ghi ra ngoài.
 *
 * Chống spam theo quyết định đã chốt với khách 30/08: honeypot + rate limit theo IP.
 * KHÔNG dùng reCAPTCHA/Turnstile (cần khoá của khách).
 */

/** Trạng thái trả về cho useActionState ở ContactForm. */
export type ContactFormState = {
  status: 'idle' | 'success' | 'error'
  /** Khoá i18n của thông báo lỗi — component tự dịch, action không trả chuỗi tiếng Việt. */
  errorKey?: string
  /** Khoá i18n lỗi theo từng field, để tô đỏ đúng ô. */
  fieldErrors?: Partial<Record<'name' | 'phone' | 'email' | 'message', string>>
  /** Giữ lại dữ liệu người dùng đã gõ khi lỗi — contract yêu cầu không mất chữ. */
  values?: {
    salutation: string
    name: string
    phone: string
    email: string
    fieldOfInterest: string
    message: string
  }
}

/**
 * Tên field bẫy bot. Đặt tên nghe như field thật để bot tự điền.
 * ContactForm.tsx khai lại đúng chuỗi này — file 'use server' chỉ được export
 * async function, nên không export hằng ra ngoài được.
 */
const HONEYPOT_FIELD = 'company_website'

const MAX_NAME = 120
const MAX_EMAIL = 200
const MAX_MESSAGE = 5000

// --- Rate limit -------------------------------------------------------------
// ⚠️ GIỚI HẠN ĐÃ BIẾT: bộ đếm nằm trong RAM của MỘT tiến trình Next.
// Chạy nhiều instance (hoặc serverless) thì mỗi instance đếm riêng → hạn mức
// thực tế nhân lên theo số instance, và restart là mất sạch bộ đếm.
// Khi deploy scale ngang phải thay bằng store dùng chung (Redis / bảng DB).
const RATE_LIMIT_MAX = 3
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000

type IpRecord = { times: number[]; lastFingerprint?: string }
const rateLimitStore = new Map<string, IpRecord>()

/** Dọn bản ghi đã hết hạn để Map không phình vô hạn theo số IP từng ghé site. */
function pruneRateLimitStore(now: number) {
  for (const [ip, record] of rateLimitStore) {
    const alive = record.times.filter((at) => now - at < RATE_LIMIT_WINDOW_MS)
    if (alive.length === 0) rateLimitStore.delete(ip)
    else record.times = alive
  }
}

/**
 * IP người gửi. Sau reverse proxy (Nginx/Cloudflare) IP thật nằm ở x-forwarded-for,
 * phần tử ĐẦU là client. Không có header nào thì gom chung vào 'unknown' —
 * thà siết nhầm còn hơn mở toang.
 */
async function getClientIp(): Promise<string> {
  const h = await headers()
  const forwarded = h.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  return h.get('x-real-ip')?.trim() || 'unknown'
}

// --- Validate ---------------------------------------------------------------

/**
 * [B1] Ba dạng số Việt Nam được chấp nhận, kiểm SAU khi đã bỏ ký tự phân cách và
 * đã quy `+84` / `0084` / `84` về dạng có số 0 đứng đầu.
 *
 *  1. Di động 10 số     `0` + đầu số nhà mạng (3|5|7|8|9) + 8 chữ số
 *                       — ví dụ 0912345678, 0356789012.
 *  2. Cố định 11 số     `02` + 9 chữ số — mã vùng sau chuyển đổi 2017 đều bắt đầu
 *                       bằng 02 và tổng luôn 11 số: 02838221234 (TP.HCM),
 *                       02432123456 (Hà Nội), 02513822123 (Đồng Nai).
 *  3. Tổng đài          `1900` / `1800` + 4 hoặc 6 chữ số (tổng 8 hoặc 10 số)
 *                       — ví dụ 19006192, 1800545455.
 *
 * CỐ Ý KHÔNG nhận: đầu số 04/06 (không tồn tại sau 2017), di động 11 số kiểu cũ,
 * số 9 chữ số trần không rõ loại, chuỗi toàn 0, và mọi chuỗi ngoài ba dạng trên.
 * Nới lỏng chỉ tới mức đủ cho khách doanh nghiệp, không nhận mọi chuỗi số.
 */
const PHONE_PATTERNS = [
  /^0[35789]\d{8}$/, // di động 10 số
  /^02\d{9}$/, // cố định 11 số
  /^1(?:900|800)(?:\d{4}|\d{6})$/, // tổng đài 8 hoặc 10 số
]

/**
 * Chuẩn hoá SĐT Việt Nam về DẠNG LƯU THỐNG NHẤT: chỉ chữ số, không khoảng trắng,
 * số nội địa luôn có `0` đứng đầu (`0912345678`, `02838221234`); tổng đài giữ
 * nguyên `19006192`. Chấp nhận đầu vào có khoảng trắng / `.` / `-` / `()`, và cả
 * `+84…`, `84…`, `0084…` — tất cả quy về dạng nội địa để nhân viên tra cứu và
 * bấm gọi không phải đoán định dạng.
 * Không khớp một trong ba mẫu ở PHONE_PATTERNS → null (server báo lỗi định dạng).
 */
function normalizePhone(raw: string): string | null {
  let digits = raw.replace(/[\s.\-()]/g, '')

  if (digits.startsWith('+')) digits = digits.slice(1)
  if (!/^\d+$/.test(digits)) return null

  // Tiền tố quốc gia → dạng nội địa. Phần còn lại phải là 9 hoặc 10 số (di động
  // 9 số sau khi bỏ 0, cố định 10 số sau khi bỏ 0) thì mới thêm lại số 0 đứng đầu.
  if (digits.startsWith('0084')) digits = digits.slice(4)
  else if (digits.startsWith('84') && (digits.length === 11 || digits.length === 12))
    digits = digits.slice(2)

  // Tổng đài 1900/1800 KHÔNG có số 0 đứng đầu — phải nhận dạng trước bước thêm 0
  // bên dưới, nếu không `1800545455` (10 số) bị biến thành `01800545455` và hỏng.
  if (/^1(?:900|800)/.test(digits)) {
    return PHONE_PATTERNS.some((re) => re.test(digits)) ? digits : null
  }

  // Số nội địa nhập thiếu số 0 đứng đầu (thường do cắt tiền tố +84): thêm lại.
  if (!digits.startsWith('0') && (digits.length === 9 || digits.length === 10)) {
    digits = `0${digits}`
  }

  return PHONE_PATTERNS.some((re) => re.test(digits)) ? digits : null
}

/** Kiểm email tối thiểu: có phần trước @, có tên miền, có chấm. Đủ cho form liên hệ. */
function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function readField(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

// --- Action -----------------------------------------------------------------

export async function submitContactForm(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const salutationRaw = readField(formData, 'salutation')
  // Select chỉ có 2 option cố định (xem ContactSubmissions.ts) — giá trị lạ (form
  // bị can thiệp, hoặc option đổi sau này mà form cache cũ) thì bỏ qua thay vì ghi bậy vào DB.
  const salutation = salutationRaw === 'anh' || salutationRaw === 'chi' ? salutationRaw : ''
  const name = readField(formData, 'name')
  const phone = readField(formData, 'phone')
  const email = readField(formData, 'email')
  const fieldOfInterest = readField(formData, 'fieldOfInterest')
  const message = readField(formData, 'message')
  const values = { salutation, name, phone, email, fieldOfInterest, message }

  // Honeypot: người thật không thấy field này nên không bao giờ điền.
  // Trả về success GIẢ — không ghi DB, không báo lỗi, để bot không học được cách né.
  if (readField(formData, HONEYPOT_FIELD) !== '') {
    return { status: 'success' }
  }

  // Server là nguồn chân lý: client validate chỉ để UX, ở đây kiểm lại từ đầu.
  const fieldErrors: ContactFormState['fieldErrors'] = {}

  if (name === '' || name.length > MAX_NAME) {
    fieldErrors.name = name === '' ? 'contact.form.error.name' : 'contact.form.error.tooLong'
  }

  const normalizedPhone = phone === '' ? null : normalizePhone(phone)
  if (phone === '') fieldErrors.phone = 'contact.form.error.phone'
  // [B1] .v2 nêu rõ số bàn + tổng đài cũng được chấp nhận (xem PHONE_PATTERNS).
  else if (!normalizedPhone) fieldErrors.phone = 'contact.form.error.phoneFormat.v2'

  if (email !== '' && (!isValidEmail(email) || email.length > MAX_EMAIL)) {
    fieldErrors.email = 'contact.form.error.email'
  }

  if (message.length > MAX_MESSAGE) fieldErrors.message = 'contact.form.error.tooLong'

  if (Object.keys(fieldErrors).length > 0) {
    return { status: 'error', fieldErrors, values }
  }

  // --- Rate limit theo IP (in-memory, xem cảnh báo ở đầu file) ---
  const now = Date.now()
  pruneRateLimitStore(now)

  const ip = await getClientIp()
  const record = rateLimitStore.get(ip) ?? { times: [] }
  const recent = record.times.filter((at) => now - at < RATE_LIMIT_WINDOW_MS)

  if (recent.length >= RATE_LIMIT_MAX) {
    rateLimitStore.set(ip, { ...record, times: recent })
    return { status: 'error', errorKey: 'contact.form.error.rateLimit', values }
  }

  // Chặn gửi trùng liên tiếp: cùng IP gửi y hệt nội dung lần trước (bấm Gửi hai
  // lần, hoặc bot lặp) → coi như đã nhận, không tạo bản ghi trùng cho nhân viên.
  const fingerprint = `${name}|${normalizedPhone}|${email}|${message}`
  if (record.lastFingerprint === fingerprint) {
    rateLimitStore.set(ip, { times: recent, lastFingerprint: fingerprint })
    return { status: 'error', errorKey: 'contact.form.error.duplicate', values }
  }

  try {
    const payload = await getPayloadClient()
    await payload.create({
      collection: 'contact-submissions',
      // Local API với quyền server: form public không có user đăng nhập.
      overrideAccess: true,
      data: {
        salutation: salutation || undefined,
        name,
        phone: normalizedPhone as string,
        email: email || undefined,
        fieldOfInterest: fieldOfInterest || undefined,
        message: message || undefined,
      },
    })
  } catch (error) {
    // Lỗi DB chỉ nằm ở log server — người dùng nhận thông điệp chung, không thấy stack.
    console.error('[W7][contact-form] Ghi contact-submissions thất bại:', error)
    return { status: 'error', errorKey: 'contact.form.error.generic', values }
  }

  rateLimitStore.set(ip, { times: [...recent, now], lastFingerprint: fingerprint })
  return { status: 'success' }
}
