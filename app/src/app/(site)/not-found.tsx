import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import { createTranslator } from '@/lib/i18n'
import { DEFAULT_LOCALE } from '@/lib/locales'
import { localizedHref } from '@/lib/nav'
import { getRequestLocale } from '@/lib/requestLocale'

/**
 * Trang 404 của phần public — nằm trong (site) nên có Header/Footer, khách lạc
 * vào vẫn điều hướng tiếp được thay vì gặp trang trắng của Next.
 *
 * Site cũ trả HTTP 200 cho trang 404 làm Google index rác (AUDIT §5.1);
 * ở đây Next trả đúng 404 kèm trang này.
 */
export default async function NotFound() {
  // Khách lạc vào /en/... thì hai lối thoát cũng phải ở lại bản tiếng Anh.
  const locale = await getRequestLocale()
  const tr = createTranslator(locale)
  const href = (path: string) => localizedHref(path, locale, DEFAULT_LOCALE)

  return (
    <Section title={tr('error.notFound.title')} subtitle={tr('error.notFound.body')}>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Button href={href('/')}>{tr('common.backToHome')}</Button>
        <Button href={href('/tin-tuc')} variant="outline">
          {tr('nav.news')}
        </Button>
      </div>
    </Section>
  )
}
