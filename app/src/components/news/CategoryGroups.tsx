import Link from 'next/link'
import { createTranslator } from '@/lib/i18n'
import { DEFAULT_LOCALE } from '@/lib/locales'
import { localizedHref } from '@/lib/nav'
import { getRequestLocale } from '@/lib/requestLocale'
import type { Category } from '@/payload-types'
import styles from './CategoryGroups.module.css'

/**
 * 12 chuyên mục chia 2 nhóm theo field `group` (AUDIT §3.8).
 * Cùng cặp nhãn với khối "Trung tâm kiến thức" ở trang chủ (W1) để khách thấy
 * một tên gọi duy nhất cho một nhóm.
 */
const GROUPS = [
  { value: 'accounting', title: 'home.knowledge.group.accounting' },
  { value: 'legal-hr', title: 'home.knowledge.group.legal-hr' },
] as const

export async function CategoryGroups({ categories }: { categories: Category[] }) {
  // Link bài/chuyên mục phải giữ ngôn ngữ đang xem; bản EN dùng path thô
  // là bấm vào rơi thẳng về trang tiếng Việt.
  const locale = await getRequestLocale()
  const t = createTranslator(await getRequestLocale())

  return (
    <div className={styles.groups}>
      {GROUPS.map((group) => {
        const items = categories.filter((category) => category.group === group.value)
        if (items.length === 0) return null

        return (
          <section key={group.value} className={styles.group}>
            <h2 className={styles.groupTitle}>{t(group.title)}</h2>
            <ul className={styles.list}>
              {items.map((category) => (
                <li key={category.id}>
                  <Link className={styles.card} href={localizedHref(`/chuyen-muc/${category.slug}`, locale, DEFAULT_LOCALE)}>
                    <span className={styles.name}>{category.name}</span>
                    {category.description && (
                      <span className={styles.description}>{category.description}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
