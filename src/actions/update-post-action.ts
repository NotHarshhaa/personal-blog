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
    await db
      .update(posts)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(and(eq(posts.id, postId), eq(posts.authorId, user.id)))

    revalidatePath(`/posts/${postId}`)
    revalidatePath('/')
    revalidatePath('/feed.xml')
  })
