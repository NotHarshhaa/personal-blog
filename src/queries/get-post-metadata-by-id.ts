import { and, eq } from 'drizzle-orm'

import { db } from '@/db'
import { posts } from '@/db/schema'

export const getPostMetadataById = async (id: string) => {
  const result = await db.query.posts.findFirst({
    where: and(eq(posts.id, id), eq(posts.published, true), eq(posts.visibility, 'public')),
    columns: {
      title: true,
      description: true,
      authorId: true,
      updatedAt: true,
      createdAt: true,
      tags: true
    }
  })

  return {
    post: result
  }
}
