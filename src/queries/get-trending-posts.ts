import { and, desc, eq, sql } from 'drizzle-orm'

import { db } from '@/db'
import { posts } from '@/db/schema'
import { withPostEngagement } from '@/utils/get-seeded-view-count'

export const getTrendingPosts = async (limit = 5) => {
  const result = await db.query.posts.findMany({
    where: and(
      eq(posts.published, true),
      eq(posts.visibility, 'public')
    ),
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
          id: true,
          userId: true
        }
      }
    },
    orderBy: desc(sql`${posts.views} + ${posts.baselineViews}`),
    limit: Math.max(limit * 4, 20)
  })

  // Sort by combined engagement score (views + likes * 5) and take top N
  const enriched = result
    .map((post) => withPostEngagement(post))
    .sort((a, b) => {
      const scoreA = a.views + a.likeCount * 5
      const scoreB = b.views + b.likeCount * 5
      return scoreB - scoreA
    })
    .slice(0, limit)

  return {
    posts: enriched
  }
}
