'use client'

import { useMemo, useState } from 'react'
import { createTranslator } from '@/lib/i18n'
import {
  calculatePayroll,
  formatVnd,
  sanitizeAmount,
  type Direction,
  type PayrollBreakdown,
} from '@/lib/payroll/calc'
import type { PayrollConfig, RegionCode } from '@/lib/payroll/config'
import { parseDependentsInput, parseVndInput } from '@/lib/payroll/parseInput'
import styles from './PayrollCalculator.module.css'

/**
 * Form tính lương Gross ↔ Net (gói W5, contract §3–§4).
 *
 * ⚠️ CAM KẾT RIÊNG TƯ (contract §8): mọi phép tính chạy TRONG component này, trên máy
 * người dùng. Không fetch, không Server Action, không ghi DB, không localStorage —
 * số lương người dùng gõ không rời trình duyệt. `config` đi vào qua props từ server
 * (chiều ngược lại, được phép), rồi mọi thứ ở lại đây.
 *
 * Trang cha là server component; chỉ khối này 'use client' vì cần state theo phím gõ.
 *
 * `locale` cũng đi vào qua props vì lý do đó: client không gọi được getRequestLocale()
 * (nó dùng headers(), chỉ chạy phía server). Trước đây file này import `t` dựng sẵn ở
 * i18n.ts — translator đó đóng băng tiếng Việt lúc import, nên trang /en hiện nhãn
 * tiếng Việt trong khi con số vẫn đúng: người đọc dễ hiểu nhầm khoản mục.
 */
export function PayrollCalculator({
  config,
  locale,
}: {
  config: PayrollConfig
  locale: string
}) {
  const t = createTranslator(locale as Parameters<typeof createTranslator>[0])
  const [direction, setDirection] = useState<Direction>('grossToNet')
  // Giữ nguyên chuỗi người dùng gõ (không ép sang number) để ô nhập không nhảy lung
  // tung khi họ xoá hết hoặc đang gõ dở. Việc làm sạch nằm ở sanitizeAmount().
  const [amountText, setAmountText] = useState('')
  const [dependentsText, setDependentsText] = useState('0')
  const [region, setRegion] = useState<RegionCode>('I')
  const [useCustomBase, setUseCustomBase] = useState(false)
  const [customBaseText, setCustomBaseText] = useState('')

  // TẦNG INPUT (F3 §2): hiểu định dạng số Việt Nam TRƯỚC khi đưa xuống tầng tính.
  // `parseVndInput` trả null cho chuỗi không hiểu được, nên ở đây phân biệt được ba
  // trạng thái mà bản cũ gộp làm một: ô trống · gõ bậy · số hợp lệ.
  const amountRaw = amountText.trim()
  const amountParsed = parseVndInput(amountText)
  const amountIsEmpty = amountRaw === ''
  const amountInvalid = !amountIsEmpty && amountParsed === null
  const amountNegative = amountParsed !== null && amountParsed < 0
  const amountHasError = amountInvalid || amountNegative

  const dependentsParsed = parseDependentsInput(dependentsText)
  const dependentsInvalid = dependentsParsed.kind === 'invalid'
  const dependents = dependentsParsed.kind === 'ok' ? dependentsParsed.value : 0
  const dependentsRounded = dependentsParsed.kind === 'ok' && dependentsParsed.rounded

  // Chỉ đưa xuống tầng tính con số đã hiểu được. `sanitizeAmount` giữ nguyên vai trò
  // lưới an toàn của TẦNG TÍNH (calc.ts không đổi một dòng, 60 test cũ còn nguyên).
  const amount = amountParsed !== null && amountParsed > 0 ? sanitizeAmount(amountParsed) : 0

  const customBaseParsed = parseVndInput(customBaseText)

  const result: PayrollBreakdown | null = useMemo(() => {
    // Ô trống / gõ bậy / số âm / 0 → không hiện bảng số 0 trông như kết quả thật.
    // Khác bản cũ: các ca lỗi giờ có thông báo riêng bên dưới, không im lặng nữa.
    if (amount <= 0 || dependentsInvalid) return null
    return calculatePayroll(
      direction,
      {
        amount,
        dependents,
        region,
        insuranceBase:
          useCustomBase && customBaseParsed !== null ? sanitizeAmount(customBaseParsed) : null,
      },
      config,
    )
  }, [direction, amount, dependents, dependentsInvalid, region, useCustomBase, customBaseParsed, config])

  const amountLabel =
    direction === 'grossToNet' ? t('payroll.field.amount.gross') : t('payroll.field.amount.net')

  // Chạm trần: hiện chú thích để người dùng hiểu vì sao khoản bảo hiểm không tăng tiếp,
  // thay vì tưởng công cụ tính sai (contract §4).
  const socialCapped = result !== null && result.insuranceBase > result.socialCapApplied
  const unempCapped = result !== null && result.insuranceBase > result.unemploymentCapApplied

  const regionOptions = config.regions.map((r) => r.code)

  return (
    <div className={styles.wrap}>
      <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
        <fieldset className={styles.directions}>
          <legend className={styles.legend}>{t('payroll.direction.legend')}</legend>
          <div className={styles.directionRow}>
            {(['grossToNet', 'netToGross'] as const).map((value) => (
              <label
                key={value}
                className={`${styles.chip} ${direction === value ? styles.chipActive : ''}`}
              >
                <input
                  type="radio"
                  name="payroll-direction"
                  value={value}
                  checked={direction === value}
                  onChange={() => setDirection(value)}
                  className={styles.srOnly}
                />
                {t(`payroll.direction.${value}`)}
              </label>
            ))}
          </div>
        </fieldset>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="payroll-amount">
            {amountLabel}
          </label>
          <input
            id="payroll-amount"
            className={`${styles.input} ${amountHasError ? styles.inputError : ''}`}
            // `inputMode numeric` cho bàn phím số trên điện thoại; type text để chữ
            // người dùng lỡ gõ không bị trình duyệt nuốt im lặng thành rỗng.
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={amountText}
            onChange={(e) => setAmountText(e.target.value)}
            aria-invalid={amountHasError || undefined}
            aria-describedby={
              amountHasError ? 'payroll-amount-error payroll-amount-hint' : 'payroll-amount-hint'
            }
          />
          {/* P0-2: dán "30.000.000" không còn im lặng biến mất — sai thì nói rõ sai gì. */}
          {amountHasError && (
            <p className={styles.error} id="payroll-amount-error" role="alert">
              {amountNegative
                ? t('payroll.error.amount.negative')
                : t('payroll.error.amount.invalid')}
            </p>
          )}
          <p className={styles.hint} id="payroll-amount-hint">
            {t('payroll.field.amount.hint')}
          </p>
        </div>

        <div className={styles.grid2}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="payroll-dependents">
              {t('payroll.field.dependents')}
            </label>
            <input
              id="payroll-dependents"
              className={`${styles.input} ${dependentsInvalid ? styles.inputError : ''}`}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={dependentsText}
              onChange={(e) => setDependentsText(e.target.value)}
              aria-invalid={dependentsInvalid || undefined}
              aria-describedby={
                dependentsInvalid
                  ? 'payroll-dependents-error payroll-dependents-hint'
                  : 'payroll-dependents-hint'
              }
            />
            {/* P1-2: `abc` / `-1` từng âm thầm thành 0 → kết quả SAI mà trông đúng.
                Giờ chặn hẳn kết quả và nói rõ, thay vì tính như không có người phụ thuộc. */}
            {dependentsInvalid && (
              <p className={styles.error} id="payroll-dependents-error" role="alert">
                {t('payroll.error.dependents.invalid')}
              </p>
            )}
            {/* `2.7` vẫn tính được nhưng phải cho thấy con số THẬT SỰ dùng (F3 §4). */}
            {dependentsRounded && (
              <p className={styles.notice} id="payroll-dependents-rounded">
                {`${t('payroll.error.dependents.rounded')} ${dependents}`}
              </p>
            )}
            <p className={styles.hint} id="payroll-dependents-hint">
              {t('payroll.field.dependents.hint')}
            </p>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="payroll-region">
              {t('payroll.field.region')}
            </label>
            <select
              id="payroll-region"
              className={styles.input}
              value={region}
              onChange={(e) => setRegion(e.target.value as RegionCode)}
              aria-describedby="payroll-region-hint"
            >
              {regionOptions.map((code) => (
                <option key={code} value={code}>
                  {`${t('payroll.field.region.option')} ${code}`}
                </option>
              ))}
            </select>
            <p className={styles.hint} id="payroll-region-hint">
              {t('payroll.field.region.hint')}
            </p>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.checkboxRow}>
            {/* P1-3: ô vuông mặc định của trình duyệt chỉ 13×13px, dưới ngưỡng chạm. */}
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={useCustomBase}
              onChange={(e) => setUseCustomBase(e.target.checked)}
            />
            <span>{t('payroll.field.customBase')}</span>
          </label>
          <p className={styles.hint}>{t('payroll.field.customBase.hint')}</p>
          {useCustomBase && (
            <>
              <label className={styles.label} htmlFor="payroll-base">
                {t('payroll.field.insuranceBase')}
              </label>
              <input
                id="payroll-base"
                className={styles.input}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={customBaseText}
                onChange={(e) => setCustomBaseText(e.target.value)}
              />
            </>
          )}
        </div>

        <p className={styles.privacy}>{t('payroll.privacy')}</p>
      </form>

      <div className={styles.results}>
        <h2 className={styles.resultTitle}>{t('payroll.result.title')}</h2>

        {/* P1-1: MỘT câu tóm tắt, đặt NGOÀI bảng chi tiết. Bọc live region quanh cả
            bảng sẽ khiến screen reader đọc lại 15 dòng số mỗi phím gõ — tệ hơn không có.
            `aria-atomic` để câu được đọc trọn vẹn, không chỉ phần chữ vừa đổi. */}
        <p className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">
          {result === null
            ? ''
            : direction === 'grossToNet'
              ? `${t('payroll.result.summary.net')} ${formatVnd(result.net)}`
              : `${t('payroll.result.summary.gross')} ${formatVnd(result.gross)}`}
        </p>

        {result === null ? (
          <p className={styles.empty}>{t('payroll.result.empty')}</p>
        ) : (
          <>
            <table className={styles.table}>
              <caption className={styles.srOnly}>{t('payroll.result.title')}</caption>
              <thead>
                <tr>
                  <th scope="col">{t('payroll.result.item')}</th>
                  <th scope="col" className={styles.numCol}>
                    {t('payroll.result.amount')}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">{t('payroll.result.gross')}</th>
                  <td className={styles.num}>{formatVnd(result.gross)}</td>
                </tr>
                <tr>
                  <th scope="row">
                    {`${t('payroll.result.social')} (${config.insuranceRates.social}%)`}
                    {socialCapped && (
                      <span className={styles.note}> — {t('payroll.result.capped')}</span>
                    )}
                  </th>
                  <td className={styles.num}>{`− ${formatVnd(result.socialInsurance)}`}</td>
                </tr>
                <tr>
                  <th scope="row">
                    {`${t('payroll.result.health')} (${config.insuranceRates.health}%)`}
                    {socialCapped && (
                      <span className={styles.note}> — {t('payroll.result.capped')}</span>
                    )}
                  </th>
                  <td className={styles.num}>{`− ${formatVnd(result.healthInsurance)}`}</td>
                </tr>
                <tr>
                  <th scope="row">
                    {`${t('payroll.result.unemployment')} (${config.insuranceRates.unemployment}%)`}
                    {unempCapped && (
                      <span className={styles.note}> — {t('payroll.result.capped')}</span>
                    )}
                  </th>
                  <td className={styles.num}>{`− ${formatVnd(result.unemploymentInsurance)}`}</td>
                </tr>
                <tr className={styles.subtotal}>
                  <th scope="row">{t('payroll.result.totalInsurance')}</th>
                  <td className={styles.num}>{`− ${formatVnd(result.totalInsurance)}`}</td>
                </tr>
                <tr className={styles.subtotal}>
                  <th scope="row">{t('payroll.result.incomeBeforeTax')}</th>
                  <td className={styles.num}>{formatVnd(result.incomeBeforeTax)}</td>
                </tr>
                <tr>
                  <th scope="row">
                    {t('payroll.result.deduction')}
                    <span className={styles.note}>
                      {` — ${t('payroll.result.deduction.personal')} ${formatVnd(
                        result.personalDeduction,
                      )}${
                        dependents > 0
                          ? `, ${dependents} ${t(
                              'payroll.result.deduction.dependents',
                            )} ${formatVnd(result.dependentDeductionTotal)}`
                          : ''
                      }`}
                    </span>
                  </th>
                  <td className={styles.num}>{`− ${formatVnd(result.totalDeduction)}`}</td>
                </tr>
                <tr className={styles.subtotal}>
                  <th scope="row">{t('payroll.result.taxableIncome')}</th>
                  <td className={styles.num}>{formatVnd(result.taxableIncome)}</td>
                </tr>
                <tr>
                  <th scope="row">{t('payroll.result.tax')}</th>
                  <td className={styles.num}>{`− ${formatVnd(result.personalIncomeTax)}`}</td>
                </tr>
                <tr className={styles.total}>
                  <th scope="row">{t('payroll.result.net')}</th>
                  <td className={styles.num}>{formatVnd(result.net)}</td>
                </tr>
              </tbody>
            </table>

            {/* Bảng từng bậc: bằng chứng để người dùng đối chiếu tay (contract §2.6 mục 2). */}
            <h3 className={styles.bracketTitle}>{t('payroll.brackets.title')}</h3>
            {result.appliedBrackets.length === 0 ? (
              <p className={styles.empty}>{t('payroll.brackets.none')}</p>
            ) : (
              <>
                {/* P0-1: dưới 768px bảng 5 cột phải cuộn ngang, giấu mất 210px và cột
                    "Thuế của bậc" hiện 0% — một con số tiền cắt cụt trông y như một con
                    số hoàn chỉnh nhỏ hơn. Cách sửa (a) của báo cáo: mobile đọc danh sách
                    thẻ dọc (không còn cuộn ngang), desktop giữ nguyên bảng.
                    Hai khối cùng dữ liệu, CSS chọn hiện đúng một khối, khối kia
                    `display:none` nên screen reader cũng chỉ gặp một bản. */}
                <ul className={styles.bracketCards}>
                  {result.appliedBrackets.map((b) => (
                    <li key={b.order} className={styles.bracketCard}>
                      <p className={styles.bracketCardHead}>
                        {`${t('payroll.brackets.card.level')} ${b.order} · ${b.rate}%`}
                      </p>
                      <dl className={styles.bracketCardList}>
                        <div className={styles.bracketCardRow}>
                          <dt className={styles.bracketCardTerm}>
                            {t('payroll.brackets.range')}
                          </dt>
                          <dd className={styles.bracketCardDesc}>
                            {b.to === null
                              ? `${formatVnd(b.from)} ${t('payroll.brackets.above')}`
                              : `${formatVnd(b.from)} – ${formatVnd(b.to)}`}
                          </dd>
                        </div>
                        <div className={styles.bracketCardRow}>
                          <dt className={styles.bracketCardTerm}>
                            {t('payroll.brackets.portion')}
                          </dt>
                          <dd className={`${styles.bracketCardDesc} ${styles.num}`}>
                            {formatVnd(b.taxableInBracket)}
                          </dd>
                        </div>
                        <div className={`${styles.bracketCardRow} ${styles.bracketCardTotal}`}>
                          <dt className={styles.bracketCardTerm}>{t('payroll.brackets.tax')}</dt>
                          <dd className={`${styles.bracketCardDesc} ${styles.num}`}>
                            {formatVnd(b.tax)}
                          </dd>
                        </div>
                      </dl>
                    </li>
                  ))}
                </ul>

                <table className={`${styles.table} ${styles.bracketTable}`}>
                  <thead>
                    <tr>
                      <th scope="col">{t('payroll.brackets.level')}</th>
                      <th scope="col">{t('payroll.brackets.range')}</th>
                      <th scope="col" className={styles.numCol}>
                        {t('payroll.brackets.rate')}
                      </th>
                      <th scope="col" className={styles.numCol}>
                        {t('payroll.brackets.portion')}
                      </th>
                      <th scope="col" className={styles.numCol}>
                        {t('payroll.brackets.tax')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.appliedBrackets.map((b) => (
                      <tr key={b.order}>
                        <th scope="row">{b.order}</th>
                        <td>
                          {b.to === null
                            ? `${formatVnd(b.from)} ${t('payroll.brackets.above')}`
                            : `${formatVnd(b.from)} – ${formatVnd(b.to)}`}
                        </td>
                        <td className={styles.num}>{`${b.rate}%`}</td>
                        <td className={styles.num}>{formatVnd(b.taxableInBracket)}</td>
                        <td className={styles.num}>{formatVnd(b.tax)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className={styles.hint}>{t('payroll.brackets.hint')}</p>
              </>
            )}
          </>
        )}

        {/* Disclaimer NGAY CẠNH kết quả, không phải footer, không chữ mờ (contract §3.5). */}
        <aside className={styles.disclaimer}>
          <strong className={styles.disclaimerTitle}>{t('payroll.disclaimer.title')}</strong>
          <p>{t('payroll.disclaimer.body')}</p>
        </aside>
      </div>
    </div>
  )
}
