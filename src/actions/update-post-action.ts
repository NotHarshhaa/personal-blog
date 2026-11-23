'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { flattenValidationErrors } from 'next-safe-action'

import { db } from '@/db'
import { posts } from '@/db/schema'
import { authenticatedActionClient } from '@/lib/safe-action'

import { updatePostSchema } from './schema'

export const updatePostAction = authenticatedActionClient
  .schema(updatePostSchema, {
    // eslint-disable-next-line @typescript-eslint/require-await -- required for the shape
    handleValidationErrorsShape: async (ve) => flattenValidationErrors(ve).fieldErrors
  })
  .action(async ({ parsedInput: { postId, ...data }, ctx: { user } }) => {
    // Non-admin authors may edit their own posts but cannot publish or
    // change visibility — publishing is an admin-only capability.
    const isAdmin = user.role === 'admin'
    // drizzle skips `undefined` fields in .set(), so non-admins simply
    // cannot change publish state or visibility through this action.
    const updateData = isAdmin
      ? data
      : { ...data, published: undefined, visibility: undefined }

    // Never allow publishing a post with an empty body — check the incoming
    // content, or fall back to the stored content when it isn't being updated.
    if (updateData.published === true) {
      let contentToCheck = updateData.content
      if (contentToCheck === undefined) {
        const existing = await db.query.posts.findFirst({
          where: eq(posts.id, postId),
          columns: { content: true }
        })
        contentToCheck = existing?.content
      }
      const text = contentToCheck
        ?.replaceAll(/<[^>]*>?/g, ' ')
        .replaceAll('&nbsp;', ' ')
        .trim()
      if (!text) {
        throw new Error('Cannot publish a post with empty content')
      }
    }

    const [updated] = await db
      .update(posts)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(
        isAdmin
          ? eq(posts.id, postId)
          : and(eq(posts.id, postId), eq(posts.authorId, user.id))
      )
      .returning({ id: posts.id })

    if (!updated) {
      throw new Error('Post not found or not authorized')
    }

    revalidatePath(`/posts/${postId}`)
    revalidatePath('/')
    revalidatePath('/feed.xml')
  })
