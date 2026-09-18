import { and, desc, eq } from 'drizzle-orm'

import { db } from '@/db'
import { posts } from '@/db/schema'
import { withPostEngagement } from '@/utils/get-seeded-view-count'

export const getTrendingPosts = async (limit = 5) => {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

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
          id: true
        }
      }
    },
    orderBy: desc(posts.views),
    limit: limit * 2 // Fetch extra to sort by engagement
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
