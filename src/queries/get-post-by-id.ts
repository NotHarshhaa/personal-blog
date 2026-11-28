import { and, asc, eq } from 'drizzle-orm'

import { db } from '@/db'
import { posts } from '@/db/schema'
import { withPostEngagement } from '@/utils/get-seeded-view-count'

export const getPostById = async (id: string) => {
  const result = await db.query.posts.findFirst({
    where: and(eq(posts.id, id), eq(posts.published, true), eq(posts.visibility, 'public')),
    columns: {
      id: true,
      title: true,
      description: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      views: true,
      baselineViews: true,
      baselineLikes: true,
      tags: true,
      seriesId: true,
      seriesOrder: true
    },
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          image: true,
          bio: true
        }
      },
      likes: {
        columns: {
          id: true,
          userId: true,
          postId: true
        }
      },
      bookmarks: {
        columns: {
          id: true,
          userId: true
        }
      },
      series: {
        columns: {
          id: true,
          title: true,
          slug: true,
          description: true
        },
        with: {
          posts: {
            where: and(eq(posts.published, true), eq(posts.visibility, 'public')),
            columns: {
              id: true,
              title: true,
              seriesOrder: true
            },
            orderBy: asc(posts.seriesOrder)
          }
        }
      }
    }
  })

  if (!result) {
    return {
      post: result
    }
  }

  return {
    post: {
      ...result,
      ...withPostEngagement({
        ...result,
        published: true
      })
    }
  }
}
