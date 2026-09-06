import { BranchMap } from '@/components/map/BranchMap'
import { createTranslator } from '@/lib/i18n'
import { getRequestLocale } from '@/lib/requestLocale'
import type { Branch } from '@/payload-types'
import styles from './BranchList.module.css'

/**
 * Danh sách chi nhánh cho trang /lien-he.
 *
 * CỐ Ý LẶP với src/components/home/Branches.tsx (W1): bản kia tự bọc <Section>
 * với tiêu đề riêng của trang chủ và thuộc gói khác. Theo rule AI-01 chỉ nêu ra,
 * không tự trích xuất component chung.
 *
 * Seed đang để phone / email / mapUrl TRỐNG (address = "Đang cập nhật") → từng
 * dòng tự ẩn, nút "Xem bản đồ" chỉ hiện khi có mapUrl (W7: nút đó nằm trong
 * <BranchMap>, mở bản đồ ngay tại chỗ thay vì mở tab Google Maps).
 */
export async function BranchList({ branches }: { branches: Branch[] }) {
  // BranchMap là client component: nó không đọc được header x-locale, nên locale
  // phải đi xuống qua props từ đây (server).
  const locale = await getRequestLocale()
  const tr = createTranslator(locale)

  if (branches.length === 0) {
    return <p className={styles.empty}>{tr('branches.empty')}</p>
  }

  return (
    <ul className={styles.grid}>
      {branches.map((branch) => (
        <li key={branch.id} className={styles.card}>
          <h3 className={styles.city}>{branch.city}</h3>

          <dl className={styles.details}>
            <dt className={styles.term}>{tr('common.address')}</dt>
            <dd className={styles.desc}>{branch.address}</dd>

            {branch.phone && (
              <>
                <dt className={styles.term}>{tr('common.hotline')}</dt>
                <dd className={styles.desc}>
                  <a className={styles.link} href={`tel:${branch.phone.replace(/[\s.]/g, '')}`}>
                    {branch.phone}
                  </a>
                </dd>
              </>
            )}

            {branch.email && (
              <>
                <dt className={styles.term}>{tr('common.email')}</dt>
                <dd className={styles.desc}>
                  <a className={styles.link} href={`mailto:${branch.email}`}>
                    {branch.email}
                  </a>
                </dd>
              </>
            )}
          </dl>

          {/*
            Không bọc thêm div: BranchMap trả null khi chi nhánh thiếu mapUrl,
            div rỗng sẽ để lại khoảng trắng thừa dưới thẻ. Khoảng cách nằm ở
            .wrap của BranchMap.
          */}
          <BranchMap mapUrl={branch.mapUrl} city={branch.city} locale={locale} />
        </li>
      ))}
    </ul>
  )
}
