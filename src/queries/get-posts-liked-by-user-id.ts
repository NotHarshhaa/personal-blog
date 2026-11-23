import { and, desc, eq, inArray } from 'drizzle-orm'

import { db } from '@/db'
import { likes, posts } from '@/db/schema'
import { withPostEngagement } from '@/utils/get-seeded-view-count'

export const getPostsLikedByUserId = async (userId: string) => {
  const likedPostIds = db
    .select({ postId: likes.postId })
    .from(likes)
    .where(eq(likes.userId, userId))

  const result = await db.query.posts.findMany({
    where: and(
      eq(posts.published, true),
      eq(posts.visibility, 'public'),
      inArray(posts.id, likedPostIds)
    ),
    columns: {
      id: true,
      title: true,
      description: true,
      published: true,
      createdAt: true,
      views: true,
      baselineViews: true,
      baselineLikes: true,
      tags: true
    },
    orderBy: desc(posts.createdAt),
    with: {
      likes: {
        columns: {
          id: true,
          userId: true
        }
      },
      user: {
        columns: {
          name: true,
          image: true,
          id: true
        }
      }
    }
  })

  return {
    posts: result.map((post) => withPostEngagement(post))
  }
}
