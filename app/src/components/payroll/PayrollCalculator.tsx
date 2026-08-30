'use client'

import { useMemo, useState } from 'react'
import { t } from '@/lib/i18n'
import {
  calculatePayroll,
  formatVnd,
  sanitizeAmount,
  sanitizeDependents,
  type Direction,
  type PayrollBreakdown,
} from '@/lib/payroll/calc'
import type { PayrollConfig, RegionCode } from '@/lib/payroll/config'
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
 */
export function PayrollCalculator({ config }: { config: PayrollConfig }) {
  const [direction, setDirection] = useState<Direction>('grossToNet')
  // Giữ nguyên chuỗi người dùng gõ (không ép sang number) để ô nhập không nhảy lung
  // tung khi họ xoá hết hoặc đang gõ dở. Việc làm sạch nằm ở sanitizeAmount().
  const [amountText, setAmountText] = useState('')
  const [dependentsText, setDependentsText] = useState('0')
  const [region, setRegion] = useState<RegionCode>('I')
  const [useCustomBase, setUseCustomBase] = useState(false)
  const [customBaseText, setCustomBaseText] = useState('')

  const amount = sanitizeAmount(amountText)
  const dependents = sanitizeDependents(dependentsText)

  const result: PayrollBreakdown | null = useMemo(() => {
    // Chưa nhập gì / nhập rác / nhập 0 → không hiện bảng số 0 trông như kết quả thật.
    if (amount <= 0) return null
    return calculatePayroll(
      direction,
      {
        amount,
        dependents,
        region,
        insuranceBase: useCustomBase ? sanitizeAmount(customBaseText) : null,
      },
      config,
    )
  }, [direction, amount, dependents, region, useCustomBase, customBaseText, config])

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
            className={styles.input}
            // `inputMode numeric` cho bàn phím số trên điện thoại; type text để chữ
            // người dùng lỡ gõ không bị trình duyệt nuốt im lặng thành rỗng.
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={amountText}
            onChange={(e) => setAmountText(e.target.value)}
            aria-describedby="payroll-amount-hint"
          />
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
              className={styles.input}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={dependentsText}
              onChange={(e) => setDependentsText(e.target.value)}
              aria-describedby="payroll-dependents-hint"
            />
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
            <input
              type="checkbox"
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
                <table className={styles.table}>
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
