'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

import { db } from '@/db'
import { likes, posts } from '@/db/schema'
import { authenticatedActionClient } from '@/lib/safe-action'

import { togglePostLikeSchema } from './schema'

export const togglePostLikeAction = authenticatedActionClient
  .schema(togglePostLikeSchema)
  .action(async ({ parsedInput: { postId }, ctx: { user } }) => {
    await db.transaction(async (tx) => {
      const [post] = await tx
        .select({ id: posts.id })
        .from(posts)
        .where(and(eq(posts.id, postId), eq(posts.published, true)))
        .for('update')

      if (!post) {
        throw new Error('Post not found')
      }

      const existingLike = await tx.query.likes.findFirst({
        columns: {
          id: true
        },
        where: and(eq(likes.postId, postId), eq(likes.userId, user.id))
      })

      if (existingLike) {
        await tx.delete(likes).where(eq(likes.id, existingLike.id))
      } else {
        await tx
          .insert(likes)
          .values({
            postId,
            userId: user.id
          })
          .onConflictDoNothing({ target: [likes.postId, likes.userId] })
      }
    })

    revalidatePath(`/posts/${postId}`)
  })
