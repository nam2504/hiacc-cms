'use client'

import type { RelationshipFieldClient } from 'payload'
import type { DefaultCellComponentProps } from 'payload'

/**
 * Ô cột "Thuộc nhóm" trong bảng Cây dịch vụ.
 *
 * Payload hiển thị ô relationship rỗng là `<No Thuộc nhóm>` — vừa khó đọc vừa
 * làm người dùng tưởng dữ liệu bị thiếu, trong khi bỏ trống ở đây là TRẠNG THÁI
 * ĐÚNG và có nghĩa rõ ràng: đó là nhóm cấp cao nhất, mục hiện trên thanh menu.
 * Hiện thẳng chữ "root" cho đúng ý nghĩa đó.
 *
 * `cellData` đến qua props (Payload truyền vào từng ô), không phải qua hook.
 */
export function ParentCell({ cellData }: DefaultCellComponentProps<RelationshipFieldClient>) {
  if (cellData === null || cellData === undefined || cellData === '') {
    return <span style={{ color: 'var(--theme-elevation-500)' }}>root</span>
  }

  // Có cha: `cellData` là bản ghi đã populate (depth ≥ 1) hoặc chỉ id.
  const title =
    typeof cellData === 'object'
      ? ((cellData as { title?: unknown }).title ?? (cellData as { id?: unknown }).id)
      : cellData

  return <span>{String(title ?? '')}</span>
}

export default ParentCell
