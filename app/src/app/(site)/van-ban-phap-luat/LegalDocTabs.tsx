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
 * Nhãn "Xem nguồn"/"Đang cập nhật"/số lượng giữ hardcode tiếng Việt như bản cũ
 * (page.tsx trước đây cũng vậy, không qua `t()`) — gap i18n có sẵn từ trước,
 * ngoài phạm vi việc đổi sang tab thật nên không tự thêm dịch thuật ở đây.
 */
export function LegalDocTabs({
  groups,
}: {
  groups: Group[]
}) {
  const [active, setActive] = useState(groups[0]?.value ?? '')
  const current = groups.find((g) => g.value === active) ?? groups[0]

  return (
    <>
      <div className={styles.tabs} role="tablist" aria-label="Nhóm văn bản">
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
          <p className={styles.groupCount}>{current.items.length} văn bản trong nhóm này.</p>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Số hiệu</th>
                  <th scope="col">Tên văn bản</th>
                  <th scope="col">Cơ quan ban hành</th>
                  <th scope="col">Hiệu lực</th>
                  <th scope="col">Liên kết</th>
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
                          Xem nguồn →
                        </a>
                      ) : (
                        <span className={styles.noSource}>Đang cập nhật</span>
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
