import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { DEFAULT_LOCALE } from '@/lib/locales'
import { localizedHref } from '@/lib/nav'
import { createTranslator } from '@/lib/i18n'
import type { TreeNode } from '@/lib/serviceTree'
import styles from './GroupSummary.module.css'

/**
 * "05 nhóm dịch vụ" ở cuối trang Giới thiệu — thẻ đánh số 01..0n kèm số hạng mục
 * (thiết kế khách 06/09). Số nhóm và số hạng mục đếm từ cây, không viết cứng:
 * khách thêm nhóm là con số đổi theo.
 *
 * [B2] `group.path` từ cây dịch vụ không có locale prefix — nhận `locale` từ
 * trang cha để tự localize, tránh /en/gioi-thieu bấm vào rơi về bản Việt.
 */
export function GroupSummary({ tree, locale }: { tree: TreeNode[]; locale: string }) {
  if (tree.length === 0) return null

  const t = createTranslator(locale as Parameters<typeof createTranslator>[0])
  const plural = (n: number) => (n === 1 ? 'one' : 'other')
  const total = String(tree.length).padStart(2, '0')

  return (
    <section className={styles.section}>
      <Container>
        <h2 className={styles.title}>{t(`about.groups.title.${plural(tree.length)}`, { total })}</h2>

        <ul className={styles.grid}>
          {tree.map((group, index) => (
            <li key={group.id}>
              <Link className={styles.card} href={localizedHref(group.path, locale, DEFAULT_LOCALE)}>
                <span className={styles.index}>{String(index + 1).padStart(2, '0')}</span>
                <span className={styles.name}>{group.title}</span>
                {group.summary ? <span className={styles.summary}>{group.summary}</span> : null}
                {group.children.length > 0 ? (
                  <span className={styles.count}>{t(`about.groups.items.${plural(group.children.length)}`, { n: String(group.children.length) })}</span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
