'use client'

import { useState } from 'react'
import { useListQuery } from '@payloadcms/ui'

/**
 * Phần client của sơ đồ cây (xem `ServiceTree.tsx` cho phần server fetch data).
 *
 * Hai việc tương tác:
 * 1. Xổ/thu gọn từng nhóm cha — state React cục bộ (`collapsed`), không đụng URL.
 * 2. Click 1 node (cha hoặc con) → lọc bảng bên dưới còn đúng bản ghi đó.
 *
 * QUAN TRỌNG: việc lọc PHẢI đi qua `useListQuery().handleWhereChange`, không
 * được tự `router.push`/`replace` đổi query string bằng tay. Bảng list của
 * Payload giữ state `query` RIÊNG trong `ListQueryProvider` (khởi tạo 1 lần từ
 * URL lúc mount) và chỉ đồng bộ MỘT CHIỀU: từ state đó ra URL, không có chiều
 * ngược lại đọc URL rồi tự cập nhật state. Tự đổi URL từ ngoài provider vẫn ra
 * đúng dữ liệu ở lần render đó (nó gọi `router.replace` thật), nhưng ngay sau
 * đó `ListQueryProvider` tự chạy lại effect đồng bộ và GHI ĐÈ URL về đúng
 * `query` state cũ của nó — thứ mình vừa đổi không hề được nó biết tới. Kết quả
 * quan sát được: bảng đã lọc đúng ngay tại thời điểm click, nhưng bấm "Bỏ lọc"
 * xong bảng hết lọc thật (do request mới đúng) mà URL lại "nảy" về lại có
 * `where` cũ — chỉ lộ ra khi đo đủ hai lượt liên tiếp trên browser thật, không
 * thấy được nếu chỉ đọc code suông.
 */

export type TreeNodeView = {
  id: string
  title: string
  slug: string | null
  depth: number
}

const styles = {
  list: { margin: 0, padding: 0, listStyle: 'none' },
  row: { display: 'flex', alignItems: 'center', padding: '.15rem 0' },
  toggle: {
    width: '1.1rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    color: 'var(--theme-elevation-500)',
    fontSize: '.75rem',
  },
  toggleSpacer: { width: '1.1rem', display: 'inline-block' },
  label: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '.1rem .3rem',
    borderRadius: '3px',
    font: 'inherit',
    textAlign: 'left' as const,
  },
  labelActive: {
    background: 'var(--theme-elevation-150)',
    fontWeight: 600,
  },
  slug: { color: 'var(--theme-elevation-500)', fontSize: '.8125rem', marginLeft: '.4rem' },
  clearBar: { marginTop: '.5rem' },
  clearBtn: {
    background: 'none',
    border: '1px solid var(--theme-elevation-200)',
    borderRadius: '3px',
    padding: '.2rem .6rem',
    fontSize: '.8125rem',
    cursor: 'pointer',
  },
} as const

export function ServiceTreeInteractive({
  nodes,
  childrenOf,
}: {
  nodes: TreeNodeView[]
  /** id cha (chuỗi, gốc dùng khoá `'__root__'`) → danh sách id con đã sắp sẵn. */
  childrenOf: Record<string, string[]>
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const { handleWhereChange, query } = useListQuery()

  // `query.where` là where-clause CHUẨN của Payload (object), không phải chuỗi
  // query string — khác hẳn cú pháp `where[id][equals]` hiện trên URL, cú pháp
  // đó chỉ là cách `qs` mã hoá object này để nhét vào URL.
  const whereIdEquals = (query?.where as { id?: { equals?: unknown } } | undefined)?.id?.equals
  const selectedId = whereIdEquals === undefined || whereIdEquals === null ? null : String(whereIdEquals)
  const hasFilter = selectedId !== null

  const toggle = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectNode = (id: string) => {
    void handleWhereChange?.({ id: { equals: id } })
  }

  const clearFilter = () => {
    void handleWhereChange?.({})
  }

  const nodeById = new Map(nodes.map((n) => [n.id, n]))

  const renderNode = (id: string) => {
    const node = nodeById.get(id)
    if (!node) return null
    const kids = childrenOf[id] ?? []
    const hasChildren = kids.length > 0
    const isCollapsed = collapsed.has(id)

    return (
      <li key={id} style={{ paddingLeft: node.depth === 0 ? 0 : '1.25rem' }}>
        <div style={styles.row}>
          {hasChildren ? (
            <button
              type="button"
              style={styles.toggle}
              onClick={() => toggle(id)}
              aria-label={isCollapsed ? 'Xổ nhóm' : 'Thu gọn nhóm'}
              aria-expanded={!isCollapsed}
            >
              {isCollapsed ? '▸' : '▾'}
            </button>
          ) : (
            <span style={styles.toggleSpacer} aria-hidden="true" />
          )}
          <button
            type="button"
            style={{
              ...styles.label,
              ...(selectedId === id ? styles.labelActive : {}),
              fontWeight: node.depth === 0 ? 600 : 400,
            }}
            onClick={() => selectNode(id)}
          >
            {node.title || '(chưa đặt tên)'}
          </button>
          {node.slug ? <span style={styles.slug}>/{node.slug}</span> : null}
        </div>
        {hasChildren && !isCollapsed ? (
          <ul style={styles.list}>{kids.map((childId) => renderNode(childId))}</ul>
        ) : null}
      </li>
    )
  }

  const roots = childrenOf['__root__'] ?? []

  return (
    <>
      <ul style={styles.list}>{roots.map((id) => renderNode(id))}</ul>
      {hasFilter ? (
        <div style={styles.clearBar}>
          <button type="button" style={styles.clearBtn} onClick={clearFilter}>
            Bỏ lọc — xem lại tất cả
          </button>
        </div>
      ) : null}
    </>
  )
}

export default ServiceTreeInteractive
