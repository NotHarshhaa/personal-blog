'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

import { db } from '@/db'
import { posts } from '@/db/schema'
import { ActionError, authenticatedActionClient } from '@/lib/safe-action'

import { deletePostSchema } from './schema'

export const deletePostAction = authenticatedActionClient
  .schema(deletePostSchema)
  .action(async ({ parsedInput: { postId }, ctx: { user } }) => {
    const [deleted] = await db
      .delete(posts)
      .where(
        user.role === 'admin'
          ? eq(posts.id, postId)
          : and(eq(posts.id, postId), eq(posts.authorId, user.id))
      )
      .returning({ id: posts.id })

    if (!deleted) {
      throw new ActionError('Post not found or not authorized')
    }

    revalidatePath('/me/posts')
    revalidatePath(`/posts/${postId}`)
    revalidatePath('/posts')
    revalidatePath('/')
    revalidatePath('/feed.xml')
    revalidatePath('/sitemap.xml')
  })
