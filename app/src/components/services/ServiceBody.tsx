import { Button } from '@/components/ui/Button'
import { RichText } from '@/components/ui/RichText'
import type { ServiceNode } from '@/payload-types'
import styles from './ServiceBody.module.css'

/**
 * Render các khối nội dung của một mục dịch vụ (`service-nodes.body`).
 *
 * Khối lạ (do đổi schema mà dữ liệu cũ còn sót) bị BỎ QUA im lặng thay vì làm
 * vỡ trang — trang thiếu một khối vẫn đọc được, trang trắng thì không.
 */

type Block = NonNullable<ServiceNode['body']>[number]

export function ServiceBody({ body }: { body?: ServiceNode['body'] }) {
  if (!body || body.length === 0) return null

  return (
    <div className={styles.body}>
      {body.map((block) => (
        <BlockRenderer key={block.id ?? `${block.blockType}-${Math.random()}`} block={block} />
      ))}
    </div>
  )
}

function BlockRenderer({ block }: { block: Block }) {
  switch (block.blockType) {
    case 'pricingTable': {
      const rows = block.rows ?? []
      if (rows.length === 0) return null
      return (
        <section className={styles.section}>
          <h2 className={styles.heading}>{block.title || 'Bảng giá dịch vụ'}</h2>
          {/* Bảng phải cuộn được trong khung riêng: trên điện thoại, bảng 3 cột
              tràn ra ngoài sẽ đẩy cả trang trượt ngang. */}
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Hạng mục</th>
                  <th scope="col">Phạm vi công việc</th>
                  <th scope="col">Phí dịch vụ</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.id ?? index}>
                    <td className={styles.cellItem}>{row.item}</td>
                    <td>{row.scope}</td>
                    <td className={styles.cellFee}>{row.fee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {block.note ? <p className={styles.note}>{block.note}</p> : null}
        </section>
      )
    }

    case 'bulletList': {
      const items = block.items ?? []
      if (items.length === 0) return null
      return (
        <section className={styles.section}>
          <h2 className={styles.heading}>{block.title}</h2>
          <ul className={styles.list}>
            {items.map((item, index) => (
              <li key={item.id ?? index}>{item.text}</li>
            ))}
          </ul>
        </section>
      )
    }

    case 'fieldTable': {
      const rows = block.rows ?? []
      if (rows.length === 0) return null
      return (
        <section className={styles.section}>
          {block.title ? <h2 className={styles.heading}>{block.title}</h2> : null}
          <dl className={styles.fieldTable}>
            {rows.map((row, index) => (
              <div className={styles.fieldRow} key={row.id ?? index}>
                <dt className={styles.fieldLabel}>{row.label}</dt>
                <dd className={styles.fieldValue}>{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )
    }

    case 'richTextBlock':
      return (
        <section className={styles.section}>
          {block.title ? <h2 className={styles.heading}>{block.title}</h2> : null}
          <RichText data={block.content} />
        </section>
      )

    case 'ctaBlock':
      return (
        <div className={styles.cta}>
          <Button href={block.href}>{block.label}</Button>
        </div>
      )

    default:
      return null
  }
}
