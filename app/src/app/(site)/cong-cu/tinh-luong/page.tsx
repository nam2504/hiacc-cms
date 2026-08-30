import type { Metadata } from 'next'
import { PayrollCalculator } from '@/components/payroll/PayrollCalculator'
import { Section } from '@/components/ui/Section'
import { t } from '@/lib/i18n'
import { getPayrollConfig } from '@/lib/payroll/global'
import styles from './page.module.css'

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

export function generateMetadata(): Metadata {
  return {
    title: t('payroll.title'),
    description: t('payroll.seo.description'),
    alternates: { canonical: '/cong-cu/tinh-luong' },
  }
}

export default async function PayrollToolPage() {
  // Global lỗi/chưa seed → getPayrollConfig() trả fallback §2, trang vẫn chạy.
  const config = await getPayrollConfig()

  return (
    <Section title={t('payroll.title')} subtitle={t('payroll.subtitle')}>
      <PayrollCalculator config={config} />

      {/* Verify được (contract §2.6 mục 1): mốc hiệu lực + căn cứ pháp lý hiện công
          khai, lấy thẳng từ global — người dùng thấy đang áp luật nào, không tin suông. */}
      <aside className={styles.legal}>
        <h2 className={styles.legalTitle}>{t('payroll.legal.title')}</h2>
        <dl className={styles.legalList}>
          <div className={styles.legalRow}>
            <dt className={styles.legalTerm}>{t('payroll.legal.effectiveFrom')}</dt>
            <dd className={styles.legalDesc}>{config.effectiveFrom}</dd>
          </div>
          <div className={styles.legalRow}>
            <dt className={styles.legalTerm}>{t('payroll.legal.basis')}</dt>
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
