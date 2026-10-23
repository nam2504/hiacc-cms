'use client'

import { useState } from 'react'
import styles from './page.module.css'

type DocRow = {
  id: string | number
  code: string
  title: string
  issuer?: string | null
  effectiveYear?: string | null
  sourceUrl?: string | null
}

type Group = {
  value: string
  label: string
  items: DocRow[]
}

/**
 * Tab thật (state, không phải anchor-link): chỉ nhóm đang chọn được render,
 * các nhóm khác ẩn hẳn khỏi DOM — đúng yêu cầu khách 12/09 "đi theo dạng tab
 * thật", không phải section xếp dọc cuộn qua anchor.
 *
 * Client component nên không gọi translator: trang cha dịch sẵn và truyền `labels`.
 */
export type LegalDocLabels = {
  groupsAria: string
  countOne: string
  countOther: string
  colCode: string
  colTitle: string
  colIssuer: string
  colEffective: string
  colLink: string
  viewSource: string
  pending: string
}

export function LegalDocTabs({
  groups,
  labels,
}: {
  groups: Group[]
  labels: LegalDocLabels
}) {
  const [active, setActive] = useState(groups[0]?.value ?? '')
  const current = groups.find((g) => g.value === active) ?? groups[0]

  return (
    <>
      <div className={styles.tabs} role="tablist" aria-label={labels.groupsAria}>
        {groups.map((group) => (
          <button
            key={group.value}
            type="button"
            role="tab"
            id={`tab-${group.value}`}
            aria-selected={group.value === active}
            aria-controls={`panel-${group.value}`}
            className={`${styles.tab} ${group.value === active ? styles.tabActive : ''}`}
            onClick={() => setActive(group.value)}
          >
            {group.label}
          </button>
        ))}
      </div>

      {current && (
        <section
          className={styles.group}
          role="tabpanel"
          id={`panel-${current.value}`}
          aria-labelledby={`tab-${current.value}`}
        >
          <h2 className={styles.groupTitle}>{current.label}</h2>
          <p className={styles.groupCount}>{(current.items.length === 1 ? labels.countOne : labels.countOther).replace('{n}', String(current.items.length))}</p>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">{labels.colCode}</th>
                  <th scope="col">{labels.colTitle}</th>
                  <th scope="col">{labels.colIssuer}</th>
                  <th scope="col">{labels.colEffective}</th>
                  <th scope="col">{labels.colLink}</th>
                </tr>
              </thead>
              <tbody>
                {current.items.map((doc) => (
                  <tr key={doc.id}>
                    <td className={styles.code}>{doc.code}</td>
                    <td className={styles.name}>{doc.title}</td>
                    <td>{doc.issuer}</td>
                    <td>{doc.effectiveYear}</td>
                    <td>
                      {doc.sourceUrl ? (
                        <a
                          className={styles.source}
                          href={doc.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {labels.viewSource}
                        </a>
                      ) : (
                        <span className={styles.noSource}>{labels.pending}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  )
}
