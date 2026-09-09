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
  /**
   * Mặc định THU GỌN mọi nhóm: cây thật là 5 nhóm / 32 hạng mục, xổ hết ngay từ
   * đầu thì phải cuộn mới thấy hết 5 nhóm và mất luôn cái nhìn tổng thể — thứ
   * mà sơ đồ này sinh ra để cho. Xổ từng nhóm khi cần.
   *
   * Khởi tạo bằng hàm (lazy init) để chỉ tính một lần lúc mount, không tính lại
   * mỗi lần render.
   */
  const [collapsed, setCollapsed] = useState<Set<string>>(
    () => new Set(Object.keys(childrenOf).filter((key) => key !== '__root__')),
  )
  const { handleWhereChange, query } = useListQuery()

  // `query.where` là where-clause CHUẨN của Payload (object), không phải chuỗi
  // query string — khác hẳn cú pháp `where[id][equals]` hiện trên URL, cú pháp
  // đó chỉ là cách `qs` mã hoá object này để nhét vào URL.
  // Phần tử đầu của `in` là chính node được click (xem `descendantsOf`), phần
  // còn lại là con cháu — dùng nó để tô đậm đúng dòng đang chọn.
  const whereId = (query?.where as { id?: { in?: unknown; equals?: unknown } } | undefined)?.id
  const whereIn = Array.isArray(whereId?.in) ? (whereId?.in as unknown[]) : null
  const rawSelected = whereIn?.[0] ?? whereId?.equals
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
   * Click một nhóm thì bảng phải hiện CẢ nhóm đó VÀ mọi hạng mục bên trong —
   * lọc còn đúng một dòng cha là vô dụng: xem một nhóm nghĩa là muốn xem những
   * gì nó chứa. Node lá không có con nên vẫn ra đúng một dòng như trước.
   *
   * Dùng `in` thay cho `equals`: đây là where-clause chuẩn của Payload, `qs` tự
   * mã hoá thành `where[id][in][]=...` trên URL.
   */
  const descendantsOf = (id: string): string[] => {
    const out: string[] = [id]
    // Duyệt theo ngăn xếp, không đệ quy: dữ liệu hỏng (cha trỏ vòng) sẽ làm
    // đệ quy tràn stack, còn ở đây `seen` chặn lại.
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
    void handleWhereChange?.({ id: { in: descendantsOf(id) } })
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
