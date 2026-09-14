'use client'

import { useState } from 'react'
import { useListQuery } from '@payloadcms/ui'
import type { TreeNodeView } from './ServiceTreeInteractive'

/**
 * Bản sao của `ServiceTreeInteractive` cho trang `pricing-plans`, khác đúng
 * MỘT điểm: bảng đang lọc là `pricing-plans`, nên where-clause phải nhắm vào
 * field `serviceNode` (relationship trỏ sang `service-nodes`), không phải
 * `id` của chính node như bên cây dịch vụ. Toàn bộ phần xổ/thu, style, cách
 * đọc/ghi `query.where` qua `useListQuery` giữ nguyên — xem comment gốc ở
 * `ServiceTreeInteractive.tsx` để biết vì sao BẮT BUỘC đi qua
 * `handleWhereChange` thay vì tự đổi URL.
 *
 * Không dùng chung 1 component với prop "tên field where": that field nằm
 * trong closure của `selectNode`, tách thành prop sẽ chỉ tiết kiệm một hằng
 * số chuỗi mà đổi tên mọi biến nội bộ (`ServiceTreeInteractive` → tên trung
 * lập) — không đáng, hai bản riêng dễ đọc hơn.
 */

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

export function PricingTreeInteractive({
  nodes,
  childrenOf,
}: {
  nodes: TreeNodeView[]
  childrenOf: Record<string, string[]>
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(
    () => new Set(Object.keys(childrenOf).filter((key) => key !== '__root__')),
  )
  const { handleWhereChange, query } = useListQuery()

  const whereServiceNode = (query?.where as { serviceNode?: { in?: unknown } } | undefined)?.serviceNode
  const whereIn = Array.isArray(whereServiceNode?.in) ? (whereServiceNode?.in as unknown[]) : null
  const rawSelected = whereIn?.[0]
  const selectedId = rawSelected === undefined || rawSelected === null ? null : String(rawSelected)
  const hasFilter = selectedId !== null

  const toggle = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  /**
   * Click 1 nhóm → hiện dòng giá của TOÀN BỘ hạng mục con bên trong (nhóm gốc
   * tự nó không bao giờ có dòng giá — xem PricingPlans.ts — nhưng nhân viên
   * bấm vào nhóm là để xem giá của mọi thứ trong nhóm, không phải để ra bảng
   * rỗng).
   */
  const descendantsOf = (id: string): string[] => {
    const out: string[] = [id]
    const seen = new Set<string>([id])
    const stack = [id]
    while (stack.length > 0) {
      const current = stack.pop() as string
      for (const kid of childrenOf[current] ?? []) {
        if (seen.has(kid)) continue
        seen.add(kid)
        out.push(kid)
        stack.push(kid)
      }
    }
    return out
  }

  const selectNode = (id: string) => {
    void handleWhereChange?.({ serviceNode: { in: descendantsOf(id) } })
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

export default PricingTreeInteractive
