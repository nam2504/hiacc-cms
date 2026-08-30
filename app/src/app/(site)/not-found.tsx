import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import { t } from '@/lib/i18n'

/**
 * Trang 404 của phần public — nằm trong (site) nên có Header/Footer, khách lạc
 * vào vẫn điều hướng tiếp được thay vì gặp trang trắng của Next.
 *
 * Site cũ trả HTTP 200 cho trang 404 làm Google index rác (AUDIT §5.1);
 * ở đây Next trả đúng 404 kèm trang này.
 */
export default function NotFound() {
  return (
    <Section title={t('error.notFound.title')} subtitle={t('error.notFound.body')}>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Button href="/">{t('common.backToHome')}</Button>
        <Button href="/tin-tuc" variant="outline">
          {t('nav.news')}
        </Button>
      </div>
    </Section>
  )
}
