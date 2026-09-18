import { and, asc, desc, eq } from 'drizzle-orm'

import { db } from '@/db'
import { posts, series } from '@/db/schema'
import { withPostEngagement } from '@/utils/get-seeded-view-count'

export const getAllSeries = async () => {
  const result = await db.query.series.findMany({
    orderBy: desc(series.createdAt),
    with: {
      posts: {
        where: and(eq(posts.published, true), eq(posts.visibility, 'public')),
        columns: {
          id: true,
          title: true,
          description: true,
          createdAt: true,
          published: true,
          views: true,
          baselineViews: true,
          baselineLikes: true,
          tags: true,
          seriesOrder: true
        },
        with: {
          likes: {
            columns: {
              id: true
            }
          }
        },
        orderBy: asc(posts.seriesOrder)
      }
    }
  })

  return {
    series: result.map((s) => ({
      ...s,
      posts: s.posts.map((p) => withPostEngagement(p))
    }))
  }
}

export const getSeriesWithPosts = async (seriesId: string) => {
  const result = await db.query.series.findFirst({
    where: eq(series.id, seriesId),
    with: {
      posts: {
        where: and(eq(posts.published, true), eq(posts.visibility, 'public')),
        columns: {
          id: true,
          title: true,
          description: true,
          createdAt: true,
          tags: true,
          seriesOrder: true
        },
        orderBy: asc(posts.seriesOrder)
      }
    }
  })

  return {
    series: result ?? null
  }
}
