'use client'

import { useEffect, useRef } from 'react'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { submitContactForm, type ContactFormState } from '@/app/(site)/lien-he/actions'
import { Button } from '@/components/ui/Button'
import { createTranslator } from '@/lib/i18n'
import styles from './ContactForm.module.css'

/**
 * Form liên hệ trang /lien-he (gói W7). Client component vì cần trạng thái
 * idle → submitting → success/error; phần còn lại của trang vẫn là server component.
 *
 * Gửi qua Server Action `submitContactForm` (Local API, quyền server) — KHÔNG
 * fetch REST /api từ browser. Validate ở đây chỉ để UX; server kiểm lại từ đầu.
 *
 * Field `company_website` là honeypot — phải trùng đúng tên hằng HONEYPOT_FIELD
 * trong actions.ts (file 'use server' không export hằng ra được).
 */
const HONEYPOT_FIELD = 'company_website'

const INITIAL_STATE: ContactFormState = { status: 'idle' }

/**
 * [B3] Thứ tự ưu tiên khi đưa người dùng tới ô sai: theo đúng thứ tự ô trên màn
 * hình, để con trỏ nhảy tới lỗi ĐẦU TIÊN người dùng gặp khi đọc từ trên xuống.
 * Khoá ở đây khớp `fieldErrors` của Server Action; giá trị là `id` của input.
 */
const FIELD_ORDER = [
  ['name', 'contact-name'],
  ['phone', 'contact-phone'],
  ['email', 'contact-email'],
  ['message', 'contact-message'],
] as const

/** Tuỳ chọn cho select "Lĩnh vực" — tên nhóm dịch vụ, đi vào qua props từ trang cha (đọc cây trong DB). */
export type FieldOfInterestOption = { value: string; label: string }

/** `t` đi vào qua prop: SubmitButton nằm dưới <form> nên không nhận locale trực tiếp. */
function SubmitButton({ t }: { t: ReturnType<typeof createTranslator> }) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? t('contact.form.submitting') : t('contact.form.submit')}
    </Button>
  )
}

export function ContactForm({
  locale,
  fieldOfInterestOptions = [],
}: {
  locale: string
  fieldOfInterestOptions?: FieldOfInterestOption[]
}) {
  // Client component: không gọi được getRequestLocale() (headers() chỉ chạy phía
  // server) → locale đi vào qua props từ trang cha.
  const t = createTranslator(locale as Parameters<typeof createTranslator>[0])
  const [state, formAction] = useActionState(submitContactForm, INITIAL_STATE)
  const formRef = useRef<HTMLFormElement>(null)
  const successRef = useRef<HTMLDivElement>(null)

  /**
   * [B3] Sau khi Server Action trả lỗi, đưa người dùng TỚI chỗ sai.
   *
   * Trước đây lỗi chỉ hiện ngay dưới input, còn trang giữ nguyên vị trí cuộn —
   * trên điện thoại 390px ô sai nằm hoàn toàn phía trên khung nhìn, người dùng
   * thấy chữ đỏ mà không thấy ô nào cần sửa (REVIEW-ux P0 #3).
   *
   * `scrollIntoView({ block: 'center' })` đặt ô vào giữa màn hình (tránh bị
   * header dính che), rồi `focus({ preventScroll: true })` để trình duyệt không
   * cuộn lần thứ hai đè lên vị trí vừa chọn. Khi lỗi là lỗi chung (rate limit,
   * trùng, lỗi DB) thì không có ô nào sai — cuộn về đầu form để đọc thông báo.
   */
  useEffect(() => {
    if (state.status !== 'error') return

    const firstErrorId = FIELD_ORDER.find(([key]) => state.fieldErrors?.[key])?.[1]
    const target = firstErrorId
      ? (document.getElementById(firstErrorId) as HTMLElement | null)
      : formRef.current

    if (!target) return

    target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    if (firstErrorId) (target as HTMLInputElement).focus({ preventScroll: true })
  }, [state])

  /**
   * [N4] Gửi xong khách không thấy xác nhận — khối success thay thế đúng vị
   * trí form trong DOM, nhưng nếu form dài hơn khung nhìn (mobile, form nhiều
   * ô) và người dùng đang cuộn dở, khối mới không tự vào tầm mắt. Cùng cơ chế
   * cuộn+focus như nhánh lỗi ở trên, `tabIndex={-1}` để `focus()` hoạt động
   * trên `<div>` (không phải control nhận focus tự nhiên).
   */
  useEffect(() => {
    if (state.status !== 'success') return
    successRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    successRef.current?.focus({ preventScroll: true })
  }, [state.status])

  if (state.status === 'success') {
    return (
      <div className={styles.success} role="status" ref={successRef} tabIndex={-1}>
        <h2 className={styles.successTitle}>{t('contact.form.success.title')}</h2>
        <p className={styles.successBody}>{t('contact.form.success.body')}</p>
      </div>
    )
  }

  const values = state.values
  const fieldErrors = state.fieldErrors ?? {}
  const hasFieldErrors = Object.keys(fieldErrors).length > 0

  return (
    <section className={styles.wrap}>
      <h2 className={styles.title}>{t('contact.form.title')}</h2>
      <p className={styles.subtitle}>{t('contact.form.subtitle')}</p>

      {/*
       * [B2] `noValidate` BẬT (trước đây là `noValidate={false}`, tức là TẮT).
       * Khi tắt, trình duyệt tự chặn submit ở `type="email"` / `required` và hiện
       * bong bóng theo ngôn ngữ MÁY KHÁCH ("Please include an '@'…"), nên Server
       * Action không bao giờ chạy và thông báo tiếng Việt trong i18n không bao giờ
       * hiện (REVIEW-ux P0 #2). Tắt validate của trình duyệt để mọi lỗi đi qua một
       * đường duy nhất: Server Action → khoá i18n tiếng Việt. Không mất an toàn vì
       * server vẫn kiểm lại từ đầu — nó vốn đã là nguồn chân lý.
       */}
      <form className={styles.form} action={formAction} noValidate ref={formRef}>
        {/*
         * [B3] Tóm tắt cho trình đọc màn hình: `aria-live` báo ngay khi có lỗi,
         * kể cả khi lỗi nằm ở ô đang ngoài khung nhìn.
         *
         * Chỉ đọc khi THẬT SỰ có ô bị đánh dấu. Lỗi mức form (chặn spam, trùng
         * lặp) không gắn với ô nào, mà câu tóm tắt lại bảo "kiểm tra lại các ô
         * được đánh dấu" — người dùng trình đọc màn hình đi tìm ô lỗi không hề
         * tồn tại, vì `aria-invalid` cả 4 ô đều false (P2-03). Lỗi mức form đã có
         * `role="alert"` bên dưới đọc đúng nội dung của nó.
         */}
        <p className={styles.srOnly} role="status" aria-live="polite">
          {hasFieldErrors ? t('contact.form.error.summary') : ''}
        </p>

        {state.errorKey && (
          <p className={styles.formError} role="alert">
            {t(state.errorKey)}
          </p>
        )}

        <div className={styles.field}>
          <label className={styles.label} htmlFor="contact-salutation">
            {t('contact.form.salutation.label')}
            <span className={styles.optional}>{t('contact.form.optional')}</span>
          </label>
          <select
            className={styles.input}
            id="contact-salutation"
            name="salutation"
            defaultValue={values?.salutation ?? ''}
          >
            <option value=""></option>
            <option value="anh">{t('contact.form.salutation.mr')}</option>
            <option value="chi">{t('contact.form.salutation.ms')}</option>
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="contact-name">
            {t('contact.form.name.label')}
            <span className={styles.required} aria-label={t('contact.form.requiredMark')}>
              *
            </span>
          </label>
          <input
            className={styles.input}
            id="contact-name"
            name="name"
            type="text"
            required
            maxLength={120}
            autoComplete="name"
            placeholder={t('contact.form.name.placeholder')}
            defaultValue={values?.name}
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? 'contact-name-error' : undefined}
          />
          {fieldErrors.name && (
            <p className={styles.fieldError} id="contact-name-error">
              {t(fieldErrors.name)}
            </p>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="contact-phone">
            {t('contact.form.phone.label')}
            <span className={styles.required} aria-label={t('contact.form.requiredMark')}>
              *
            </span>
          </label>
          <input
            className={styles.input}
            id="contact-phone"
            name="phone"
            type="tel"
            required
            maxLength={20}
            autoComplete="tel"
            placeholder={t('contact.form.phone.placeholder')}
            defaultValue={values?.phone}
            aria-invalid={Boolean(fieldErrors.phone)}
            aria-describedby={fieldErrors.phone ? 'contact-phone-error' : undefined}
          />
          {fieldErrors.phone && (
            <p className={styles.fieldError} id="contact-phone-error">
              {t(fieldErrors.phone)}
            </p>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="contact-email">
            {t('contact.form.email.label')}
            <span className={styles.optional}>{t('contact.form.optional')}</span>
          </label>
          <input
            className={styles.input}
            id="contact-email"
            name="email"
            type="email"
            maxLength={200}
            autoComplete="email"
            placeholder={t('contact.form.email.placeholder')}
            defaultValue={values?.email}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? 'contact-email-error' : undefined}
          />
          {fieldErrors.email && (
            <p className={styles.fieldError} id="contact-email-error">
              {t(fieldErrors.email)}
            </p>
          )}
        </div>

        {fieldOfInterestOptions.length > 0 && (
          <div className={styles.field}>
            <label className={styles.label} htmlFor="contact-field-of-interest">
              {t('contact.form.fieldOfInterest.label')}
              <span className={styles.optional}>{t('contact.form.optional')}</span>
            </label>
            <select
              className={styles.input}
              id="contact-field-of-interest"
              name="fieldOfInterest"
              defaultValue={values?.fieldOfInterest ?? ''}
            >
              <option value="">{t('contact.form.fieldOfInterest.placeholder')}</option>
              {fieldOfInterestOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className={styles.field}>
          <label className={styles.label} htmlFor="contact-message">
            {t('contact.form.message.label')}
            <span className={styles.optional}>{t('contact.form.optional')}</span>
          </label>
          <textarea
            className={styles.textarea}
            id="contact-message"
            name="message"
            rows={5}
            maxLength={5000}
            placeholder={t('contact.form.message.placeholder')}
            defaultValue={values?.message}
            aria-invalid={Boolean(fieldErrors.message)}
            aria-describedby={fieldErrors.message ? 'contact-message-error' : undefined}
          />
          {fieldErrors.message && (
            <p className={styles.fieldError} id="contact-message-error">
              {t(fieldErrors.message)}
            </p>
          )}
        </div>

        {/* Honeypot: ẩn khỏi mắt người và khỏi trình đọc màn hình, bot vẫn thấy và điền. */}
        <div className={styles.honeypot} aria-hidden="true">
          <label htmlFor="contact-company-website">{t('contact.form.honeypot.label')}</label>
          <input
            id="contact-company-website"
            name={HONEYPOT_FIELD}
            type="text"
            tabIndex={-1}
            autoComplete="off"
            defaultValue=""
          />
        </div>

        <div className={styles.actions}>
          <SubmitButton t={t} />
        </div>
      </form>
    </section>
  )
}
