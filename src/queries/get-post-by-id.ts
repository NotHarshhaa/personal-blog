import { and, eq } from 'drizzle-orm'

import { db } from '@/db'
import { posts } from '@/db/schema'
import { withPostEngagement } from '@/utils/get-seeded-view-count'

export const getPostById = async (id: string) => {
  const result = await db.query.posts.findFirst({
    where: and(eq(posts.id, id), eq(posts.published, true)),
    columns: {
      id: true,
      title: true,
      description: true,
      content: true,
      createdAt: true,
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
          image: true
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
            columns: {
              id: true,
              title: true,
              seriesOrder: true
            }
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
