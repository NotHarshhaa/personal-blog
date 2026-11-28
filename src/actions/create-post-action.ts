'use server'

import { revalidatePath } from 'next/cache'
import { flattenValidationErrors } from 'next-safe-action'

import { db } from '@/db'
import { posts } from '@/db/schema'
import { ActionError, authenticatedActionClient } from '@/lib/safe-action'

import { createPostSchema } from './schema'

export const createPostAction = authenticatedActionClient
  .schema(createPostSchema, {
    // eslint-disable-next-line @typescript-eslint/require-await -- required for the shape
    handleValidationErrorsShape: async (ve) => flattenValidationErrors(ve).fieldErrors
  })
  .action(async ({ parsedInput: { title }, ctx: { user } }) => {
    if (user.role !== 'admin') {
      throw new ActionError('Not authorized')
    }

    const [post] = await db
      .insert(posts)
      .values({
        title,
        authorId: user.id
      })
      .returning({
        id: posts.id
      })

    revalidatePath('/me/posts')

    return {
      postId: post?.id
    }
  })
