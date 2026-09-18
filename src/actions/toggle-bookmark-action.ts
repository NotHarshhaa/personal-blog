'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

import { db } from '@/db'
import { bookmarks, posts } from '@/db/schema'
import { authenticatedActionClient } from '@/lib/safe-action'

import { toggleBookmarkSchema } from './schema'

export const toggleBookmarkAction = authenticatedActionClient
  .schema(toggleBookmarkSchema)
  .action(async ({ parsedInput: { postId }, ctx: { user } }) => {
    let isBookmarked = false

    await db.transaction(async (tx) => {
      const [post] = await tx
        .select({ id: posts.id })
        .from(posts)
        .where(and(eq(posts.id, postId), eq(posts.published, true)))
        .for('update')

      if (!post) {
        throw new Error('Post not found')
      }

      const existing = await tx.query.bookmarks.findFirst({
        columns: {
          id: true
        },
        where: and(eq(bookmarks.postId, postId), eq(bookmarks.userId, user.id))
      })

      if (existing) {
        await tx.delete(bookmarks).where(eq(bookmarks.id, existing.id))
        isBookmarked = false
      } else {
        await tx
          .insert(bookmarks)
          .values({
            postId,
            userId: user.id
          })
          .onConflictDoNothing({ target: [bookmarks.postId, bookmarks.userId] })
        isBookmarked = true
      }
    })

    revalidatePath(`/posts/${postId}`)
    revalidatePath('/bookmarks')

    return { isBookmarked }
  })
