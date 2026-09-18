import { desc, eq } from 'drizzle-orm'

import { db } from '@/db'
import { bookmarks } from '@/db/schema'
import { withPostEngagement } from '@/utils/get-seeded-view-count'

export const getUserBookmarks = async (userId: string) => {
  const result = await db.query.bookmarks.findMany({
    where: eq(bookmarks.userId, userId),
    orderBy: desc(bookmarks.createdAt),
    with: {
      post: {
        columns: {
          id: true,
          title: true,
          description: true,
          createdAt: true,
          published: true,
          views: true,
          baselineViews: true,
          baselineLikes: true,
          tags: true
        },
        with: {
          user: {
            columns: {
              name: true,
              image: true,
              id: true
            }
          },
          likes: {
            columns: {
              id: true
            }
          }
        }
      }
    }
  })

  // Filter out any posts that might be unpublished/deleted
  const bookmarkedPosts = result.flatMap((b) =>
    b.post.published ? [withPostEngagement(b.post)] : []
  )

  return {
    posts: bookmarkedPosts
  }
}
