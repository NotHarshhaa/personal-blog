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
        image: data.image,
        bio: data.bio,
        github: data.github ?? null,
        twitter: data.twitter ?? null,
        linkedin: data.linkedin ?? null,
        theme: data.theme ?? null,
        updatedAt: new Date()
      })
      .where(and(eq(users.id, user.id)))

    revalidatePath(`/users/${user.id}`)
  })
