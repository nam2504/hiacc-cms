import Link from 'next/link'
import { Section } from '@/components/ui/Section'
import { t } from '@/lib/i18n'
import type { Category } from '@/payload-types'
import styles from './Knowledge.module.css'

/**
 * Khối 8 — AUDIT §3.8: 12 chuyên mục chia 2 nhóm theo field `group`.
 * Nhóm nào không có chuyên mục thì ẩn; hết cả hai thì ẩn khối.
 */
const GROUPS = [
  { value: 'accounting', title: 'home.knowledge.group.accounting' },
  { value: 'legal-hr', title: 'home.knowledge.group.legal-hr' },
] as const

export function Knowledge({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null

  return (
    <Section title={t('home.knowledge.title')} subtitle={t('home.knowledge.subtitle')}>
      <div className={styles.groups}>
        {GROUPS.map((group) => {
          const items = categories.filter((category) => category.group === group.value)
          if (items.length === 0) return null

          return (
            <div key={group.value} className={styles.group}>
              <h3 className={styles.groupTitle}>{t(group.title)}</h3>
              <ul className={styles.list}>
                {items.map((category) => (
                  <li key={category.id}>
                    <Link className={styles.link} href={`/chuyen-muc/${category.slug}`}>
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </Section>
  )
}
