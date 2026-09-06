import { getRequestLocale } from '@/lib/requestLocale'
import type { Metadata } from 'next'
import { PayrollCalculator } from '@/components/payroll/PayrollCalculator'
import { Section } from '@/components/ui/Section'
import { createTranslator } from '@/lib/i18n'
import { getPayrollConfig } from '@/lib/payroll/global'
import styles from './page.module.css'
import { localeAlternates, ogLocale } from '@/lib/seo'

/**
 * /cong-cu/tinh-luong — công cụ tính lương Gross ↔ Net (gói W5).
 * Route chốt ở INTERFACE §6.2, không đổi.
 *
 * Trang này là SERVER component: nó chỉ đọc số liệu luật từ global `payroll-config`
 * rồi truyền xuống <PayrollCalculator> ('use client'). Phép tính chạy hoàn toàn ở
 * trình duyệt — lương người dùng nhập không bao giờ được gửi về server (contract §1, §8).
 *
 * `dynamic = 'force-dynamic'`: đây là điều kiện của yêu cầu "verify được" (contract §2.6
 * mục 3) — kế toán sửa số trong /admin thì trang phải đổi theo NGAY, không cần build lại.
 * Nếu để Next prerender tĩnh lúc build, số liệu luật sẽ đóng băng vào bundle và mọi lần
 * sửa trong admin đều vô hình cho tới lần deploy sau.
 */
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  const tr = createTranslator(locale as Parameters<typeof createTranslator>[0])
  return {
    title: tr('payroll.title'),
    description: tr('payroll.seo.description'),
    alternates: localeAlternates('/cong-cu/tinh-luong', locale),
  }
}

export default async function PayrollToolPage() {
  // Global lỗi/chưa seed → getPayrollConfig() trả fallback §2, trang vẫn chạy.
  const config = await getPayrollConfig()
  // <PayrollCalculator> là client component → locale phải đi xuống qua props.
  const locale = await getRequestLocale()
  const tr = createTranslator(locale)

  return (
    <Section>
      {/* P1-4: trang này từng không có <h1> nào (Section render tiêu đề thành <h2>).
          User chốt cách KHÔNG đụng W0: không truyền `title`/`subtitle` cho <Section>
          nữa, trang tự dựng <h1> và mô tả, sao chép đúng nhịp của Section.module.css
          (căn giữa, gạch đỏ dưới tiêu đề, subtitle 640px) để nhìn giống hệt trang khác.
          Cây heading sau khi sửa: h1 → h2 "Kết quả bóc tách" → h2 "Số liệu đang áp dụng". */}
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{tr('payroll.title')}</h1>
        <p className={styles.pageSubtitle}>{tr('payroll.subtitle')}</p>
      </header>

      <PayrollCalculator config={config} locale={locale} />

      {/* Verify được (contract §2.6 mục 1): mốc hiệu lực + căn cứ pháp lý hiện công
          khai, lấy thẳng từ global — người dùng thấy đang áp luật nào, không tin suông. */}
      <aside className={styles.legal}>
        <h2 className={styles.legalTitle}>{tr('payroll.legal.title')}</h2>
        <dl className={styles.legalList}>
          <div className={styles.legalRow}>
            <dt className={styles.legalTerm}>{tr('payroll.legal.effectiveFrom')}</dt>
            <dd className={styles.legalDesc}>{config.effectiveFrom}</dd>
          </div>
          <div className={styles.legalRow}>
            <dt className={styles.legalTerm}>{tr('payroll.legal.basis')}</dt>
            <dd className={styles.legalDesc}>
              {/* legalBasis là textarea nhiều dòng trong admin — tách dòng để đọc được,
                  không đổ nguyên khối chữ dính liền. */}
              <ul className={styles.basisList}>
                {config.legalBasis
                  .split('\n')
                  .map((line) => line.trim())
                  .filter((line) => line !== '')
                  .map((line) => (
                    <li key={line}>{line}</li>
                  ))}
              </ul>
            </dd>
          </div>
        </dl>
      </aside>
    </Section>
  )
}
