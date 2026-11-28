'use server'

import type { z } from 'zod'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { flattenValidationErrors } from 'next-safe-action'

import { db } from '@/db'
import { users } from '@/db/schema'
import { authenticatedActionClient } from '@/lib/safe-action'

import { updateUserSchema } from './schema'

type ActionCtx = {
  user: {
    id: string
  }
}

const emptyToNull = (value?: string | null) => (value && value.length > 0 ? value : null)

export const updateUserAction = authenticatedActionClient
  .schema(updateUserSchema, {
    // eslint-disable-next-line @typescript-eslint/require-await -- required for the shape
    handleValidationErrorsShape: async (ve) => flattenValidationErrors(ve).fieldErrors
  })
  .action(async ({ parsedInput: data, ctx: { user } }: { parsedInput: z.infer<typeof updateUserSchema>, ctx: ActionCtx }) => {
    await db
      .update(users)
      .set({
        name: data.name,
        image: emptyToNull(data.image),
        bio: emptyToNull(data.bio),
        github: emptyToNull(data.github),
        twitter: emptyToNull(data.twitter),
        linkedin: emptyToNull(data.linkedin),
        theme: emptyToNull(data.theme),
        updatedAt: new Date()
      })
      .where(and(eq(users.id, user.id)))

    revalidatePath(`/users/${user.id}`)
    revalidatePath('/me/settings')
    revalidatePath('/')
    revalidatePath('/posts')
  })
