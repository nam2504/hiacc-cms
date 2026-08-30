import { PostCard } from './PostCard'
import type { Post } from '@/payload-types'
import styles from './PostGrid.module.css'

/** Lưới thẻ bài viết. Rỗng thì KHÔNG render gì — chỗ gọi tự quyết hiện EmptyState. */
export function PostGrid({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null

  return (
    <ul className={styles.grid}>
      {posts.map((post) => (
        <li key={post.id} className={styles.item}>
          <PostCard post={post} />
        </li>
      ))}
    </ul>
  )
}
