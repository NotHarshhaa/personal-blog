'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

import { db } from '@/db'
import { snippets } from '@/db/schema'
import { authenticatedActionClient } from '@/lib/safe-action'

import { deleteSnippetSchema } from './schema'

export const deleteSnippetAction = authenticatedActionClient
  .schema(deleteSnippetSchema)
  .action(async ({ parsedInput, ctx: { user } }) => {
    if (user.role !== 'admin') {
      throw new Error('Not authorized')
    }

    await db.delete(snippets).where(eq(snippets.id, parsedInput.snippetId))

    revalidatePath('/snippets')
    revalidatePath('/admin/snippets')

    return {
      snippetId: parsedInput.snippetId
    }
  })
