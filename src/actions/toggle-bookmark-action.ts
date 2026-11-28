'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

import { db } from '@/db'
import { bookmarks, posts } from '@/db/schema'
import { ActionError, authenticatedActionClient } from '@/lib/safe-action'

import { toggleBookmarkSchema } from './schema'

export const toggleBookmarkAction = authenticatedActionClient
  .schema(toggleBookmarkSchema)
  .action(async ({ parsedInput: { postId, bookmarked }, ctx: { user } }) => {
    let isBookmarked = false

    await db.transaction(async (tx) => {
      const [post] = await tx
        .select({ id: posts.id })
        .from(posts)
        .where(and(eq(posts.id, postId), eq(posts.published, true), eq(posts.visibility, 'public')))
        .for('update')

      if (!post) {
        throw new ActionError('Post not found')
      }

      const existing = await tx.query.bookmarks.findFirst({
        columns: {
          id: true
        },
        where: and(eq(bookmarks.postId, postId), eq(bookmarks.userId, user.id))
      })

      const shouldBookmark = bookmarked ?? !existing

      if (shouldBookmark) {
        if (!existing) {
          await tx
            .insert(bookmarks)
            .values({
              postId,
              userId: user.id
            })
            .onConflictDoNothing({ target: [bookmarks.postId, bookmarks.userId] })
        }
        isBookmarked = true
      } else {
        if (existing) {
          await tx.delete(bookmarks).where(eq(bookmarks.id, existing.id))
        }
        isBookmarked = false
      }
    })

    revalidatePath(`/posts/${postId}`)
    revalidatePath('/bookmarks')

    return { isBookmarked }
  })

export const clearBookmarksAction = authenticatedActionClient.action(async ({ ctx: { user } }) => {
  await db.delete(bookmarks).where(eq(bookmarks.userId, user.id))

  revalidatePath('/bookmarks')
  return { cleared: true }
})
