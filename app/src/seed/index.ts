/**
 * Nạp nội dung mẫu vào DB. Chạy: `npm run seed`.
 *
 * Idempotent: có bản ghi cùng slug rồi thì BỎ QUA việc tạo mới, không ghi đè —
 * chạy lại nhiều lần an toàn và không xoá mất nội dung khách đã sửa trong admin.
 *
 * Ngoại lệ duy nhất: nếu bản ghi đã có (slug trùng) nhưng field `content`/`summary`
 * đang RỖNG, seed điền field rỗng đó bằng nội dung mẫu tương ứng trong data.ts
 * (gói C1). Field đã có nội dung (khách đã sửa tay) thì không đụng.
 */
import { existsSync } from 'node:fs'
import path from 'node:path'
import { getPayload } from 'payload'
import config from '../payload.config'

import {
  BRANCHES,
  CATEGORIES,
  PAGE_IMAGES,
  PAGES,
  POST_IMAGES,
  POSTS,
  SERVICE_IMAGES,
  SERVICES,
  SETTINGS,
  SETTINGS_HERO_IMAGE,
} from './data'
import { seedPayrollConfig } from './payrollConfig'
import { seedServiceTree } from './serviceTree'
import { seedLegalDocuments } from './legalDocuments'
import { migrateServicesToTree } from './migrateServices'
import { seedServiceTreeEn } from './serviceTreeEn'
import { seedPricingPlans } from './pricingPlans'

/**
 * Thư mục chứa file ảnh stock nguồn để nạp qua Local API (gói M1, đợt 6).
 * KHÔNG commit ảnh gốc vào git (dung lượng lớn) — set biến môi trường
 * `SEED_STOCK_IMAGES_DIR` trỏ tới thư mục chứa các file ảnh trước khi chạy `npm run seed`.
 * Không set / thư mục không tồn tại → seed bỏ qua bước gắn ảnh, không lỗi (idempotent
 * với môi trường không có sẵn ảnh, ví dụ CI).
 */
const STOCK_IMAGES_DIR = process.env.SEED_STOCK_IMAGES_DIR ?? ''

/** RichText Lexical rỗng coi như "chưa có nội dung" nếu không có children hoặc chỉ có 1 paragraph rỗng. */
const isEmptyRichText = (value: unknown): boolean => {
  if (!value || typeof value !== 'object') return true
  const root = (value as { root?: { children?: unknown[] } }).root
  if (!root || !Array.isArray(root.children) || root.children.length === 0) return true
  if (root.children.length === 1) {
    const only = root.children[0] as { children?: unknown[] }
    if (!only.children || only.children.length === 0) return true
  }
  return false
}

/**
 * Dùng top-level await, KHÔNG gọi seed().catch(...) — `payload run` kết thúc
 * process ngay khi module chạy xong, promise chưa await sẽ bị bỏ giữa chừng
 * và script thoát 0 mà không ghi gì.
 */
async function seed() {
  const payload = await getPayload({ config })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const findBySlug = async (collection: 'categories' | 'services' | 'pages' | 'posts', slug: string): Promise<any> => {
    const res = await payload.find({ collection, where: { slug: { equals: slug } }, limit: 1 })
    return res.docs[0] ?? null
  }

  let created = 0
  let skipped = 0
  let filled = 0
  let mediaLinked = 0

  /**
   * Tìm bản ghi media theo filename (idempotent — không tạo trùng khi seed chạy lại).
   * Chưa có thì tạo qua Local API với filePath, để Payload tự sinh 3 kích thước.
   * Trả về null nếu không tìm được file nguồn (ví dụ chạy seed trên máy không có
   * thư mục ảnh) — gọi nơi dùng phải tự bỏ qua an toàn.
   */
  const ensureMedia = async (filename: string, alt: string): Promise<number | null> => {
    const existing = await payload.find({
      collection: 'media',
      where: { filename: { equals: filename } },
      limit: 1,
    })
    /**
     * Có bản ghi trong DB CHƯA CHẮC file còn trên đĩa: nếu thư mục media không
     * nằm trên ổ bền, deploy bản mới làm mất file mà bản ghi vẫn ở lại. Trước
     * đây seed thấy bản ghi là bỏ qua ngay, nên không bao giờ ghi lại được file
     * — ảnh vỡ vĩnh viễn. Kiểm tra cả hai: bản ghi CÒN và file CÒN.
     */
    if (existing.docs[0]) {
      const doc = existing.docs[0]
      const mediaDir = process.env.MEDIA_DIR || path.resolve(process.cwd(), 'public/media')
      const onDisk = doc.filename ? existsSync(path.join(mediaDir, doc.filename)) : false
      if (onDisk) return doc.id as number

      payload.logger.warn(
        `Bản ghi ảnh "${filename}" còn trong DB nhưng file đã mất trên đĩa — nạp lại.`,
      )
      await payload.delete({ collection: 'media', id: doc.id })
    }

    if (!STOCK_IMAGES_DIR) return null
    const filePath = path.join(STOCK_IMAGES_DIR, filename)
    try {
      const doc = await payload.create({
        collection: 'media',
        data: { alt },
        filePath,
      })
      mediaLinked++
      return doc.id as number
    } catch (err) {
      payload.logger.warn(`Không nạp được ảnh "${filename}": ${(err as Error).message}`)
      return null
    }
  }

  for (const cat of CATEGORIES) {
    if (await findBySlug('categories', cat.slug)) {
      skipped++
      continue
    }
    await payload.create({ collection: 'categories', data: { ...cat } })
    created++
  }

  for (const svc of SERVICES) {
    const imageSpec = SERVICE_IMAGES[svc.slug]
    const image = imageSpec ? await ensureMedia(imageSpec.filename, imageSpec.alt) : null
    const existing = await findBySlug('services', svc.slug)
    if (existing) {
      skipped++
      const patch: Record<string, unknown> = {}
      if (!existing.summary) patch.summary = svc.summary
      if (isEmptyRichText(existing.content)) patch.content = svc.content
      // Chỉ gắn khi ô ảnh còn trống — khách đã chọn ảnh riêng thì không đè.
      if (image && !existing.image) patch.image = image
      if (Object.keys(patch).length > 0) {
        await payload.update({ collection: 'services', id: existing.id, data: patch })
        filled++
      }
      continue
    }
    await payload.create({ collection: 'services', data: { ...svc, ...(image ? { image } : {}) } })
    created++
  }

  for (const page of PAGES) {
    const imageSpec = (PAGE_IMAGES as Record<string, { filename: string; alt: string } | undefined>)[page.slug]
    const heroImage = imageSpec ? await ensureMedia(imageSpec.filename, imageSpec.alt) : null

    const existing = await findBySlug('pages', page.slug)
    if (existing) {
      skipped++
      const patch: Record<string, unknown> = {}
      if (isEmptyRichText(existing.content)) patch.content = page.content
      if (heroImage && !existing.heroImage) patch.heroImage = heroImage
      if (Object.keys(patch).length > 0) {
        await payload.update({ collection: 'pages', id: existing.id, data: patch })
        filled++
      }
      continue
    }
    await payload.create({
      collection: 'pages',
      data: { ...page, ...(heroImage ? { heroImage } : {}), _status: 'published' },
    })
    created++
  }

  // Chi nhánh không có slug — dùng tên thành phố làm khoá chống trùng
  for (const branch of BRANCHES) {
    const res = await payload.find({
      collection: 'branches',
      where: { city: { equals: branch.city } },
      limit: 1,
    })
    if (res.docs.length > 0) {
      skipped++
      continue
    }
    await payload.create({ collection: 'branches', data: { ...branch } })
    created++
  }

  // Bài viết cần chuyên mục có sẵn → chạy sau vòng CATEGORIES ở trên
  for (const post of POSTS) {
    const imageSpec = (POST_IMAGES as Record<string, { filename: string; alt: string } | undefined>)[post.slug]
    const cover = imageSpec ? await ensureMedia(imageSpec.filename, imageSpec.alt) : null

    const existingPost = await findBySlug('posts', post.slug)
    if (existingPost) {
      skipped++
      const patch: Record<string, unknown> = {}
      if (isEmptyRichText(existingPost.content)) patch.content = post.content
      if (cover && !existingPost.cover) patch.cover = cover
      if (Object.keys(patch).length > 0) {
        await payload.update({ collection: 'posts', id: existingPost.id, data: patch })
        filled++
      }
      continue
    }
    const cat = await payload.find({
      collection: 'categories',
      where: { slug: { equals: post.categorySlug } },
      limit: 1,
    })
    const category = cat.docs[0]
    if (!category) {
      payload.logger.warn(`Bỏ qua bài "${post.title}": không tìm thấy chuyên mục ${post.categorySlug}`)
      skipped++
      continue
    }
    const { categorySlug: _unused, ...rest } = post
    await payload.create({
      collection: 'posts',
      data: { ...rest, ...(cover ? { cover } : {}), category: category.id, _status: 'published' },
    })
    created++
  }

  // Settings là global: chỉ điền field còn trống, không đè giá trị khách đã nhập
  const current = await payload.findGlobal({ slug: 'settings' })
  const merged: Record<string, unknown> = { ...SETTINGS }
  for (const [key, value] of Object.entries(current ?? {})) {
    // Mảng rỗng cũng là "chưa có dữ liệu": Payload trả [] cho array chưa ai nhập,
    // mà [] không phải null cũng không phải '' nên vòng lặp cũ coi là giá trị
    // thật rồi giữ lại, khiến seed không bao giờ điền được các field dạng array.
    if (Array.isArray(value) && value.length === 0) continue
    if (value !== null && value !== undefined && value !== '') merged[key] = value
  }
  // Ảnh hero: chỉ nạp khi khách CHƯA chọn ảnh nào, để seed không đè ảnh thật.
  if (!current?.heroImage && SETTINGS_HERO_IMAGE) {
    const heroId = await ensureMedia(SETTINGS_HERO_IMAGE.filename, SETTINGS_HERO_IMAGE.alt)
    if (heroId) merged.heroImage = heroId
  }
  await payload.updateGlobal({ slug: 'settings', data: merged })

  // Cây dịch vụ (5 nhóm / 32 hạng mục theo SET WEB.xlsx 06/09). Tên hạng mục là
  // thật, nội dung bên trong để khách nhập — xem chú thích trong serviceTree.ts.
  await seedServiceTree(payload)

  // Danh mục văn bản pháp luật (thiết kế 06/09). Link nguồn để khách tự điền.
  await seedLegalDocuments(payload)

  // Chuyển nội dung 7 dịch vụ của cấu trúc cũ sang cây. Không xoá bản ghi cũ,
  // không đè nội dung đã có trong cây — xem chú thích trong migrateServices.ts.
  await migrateServicesToTree(payload)

  // Bản tiếng Anh: tên nhóm và hạng mục, cộng nội dung hai hạng mục demo.
  await seedServiceTreeEn(payload)

  // Bảng giá placeholder mỗi nhóm dịch vụ gốc — chạy sau cây dịch vụ vì cần
  // service-nodes đã tồn tại để tra id nhóm gốc theo slug.
  await seedPricingPlans(payload)

  // payroll-config (W5) cũng là global, cùng nguyên tắc: chỉ điền ô còn trống.
  const payrollFilled = await seedPayrollConfig(payload)
  if (payrollFilled > 0) {
    payload.logger.info(`Cấu hình tính lương: điền ${payrollFilled} field còn trống.`)
  }

  payload.logger.info(
    `Seed xong: tạo mới ${created}, bỏ qua ${skipped} (đã có), điền content còn rỗng ${filled}, ảnh nạp mới ${mediaLinked}.`,
  )
}

await seed()
process.exit(0)
