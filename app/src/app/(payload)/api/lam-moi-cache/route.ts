import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers as nextHeaders } from 'next/headers'

/**
 * Xoá cache ISR để nội dung vừa sửa trong /admin hiện ra ngay, không phải đợi
 * hết 10 phút (`revalidate = 600` ở các trang public).
 *
 * CHỈ nhận POST từ người đã đăng nhập admin: revalidate là thao tác tốn CPU
 * (dựng lại toàn bộ trang), để mở thì bất kỳ ai cũng gọi liên tục được và biến
 * ISR thành vô dụng — hoặc tệ hơn là thành một đường DoS rẻ tiền.
 *
 * `revalidatePath('/', 'layout')` quét toàn bộ cây dưới `/`, gồm cả các trang
 * ngôn ngữ khác — dùng một lệnh thay vì liệt kê từng đường dẫn, vì cây dịch vụ
 * sinh từ DB nên danh sách đường dẫn không cố định.
 */
export async function POST() {
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: await nextHeaders() })

  if (!user) {
    return NextResponse.json({ message: 'Cần đăng nhập admin.' }, { status: 401 })
  }

  revalidatePath('/', 'layout')

  return NextResponse.json({
    message: 'Đã làm mới cache. Tải lại trang web để xem nội dung mới.',
    at: new Date().toISOString(),
  })
}
