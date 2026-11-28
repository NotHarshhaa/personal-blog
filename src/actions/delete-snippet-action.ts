'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

import { db } from '@/db'
import { snippets } from '@/db/schema'
import { ActionError, authenticatedActionClient } from '@/lib/safe-action'

import { deleteSnippetSchema } from './schema'

export const deleteSnippetAction = authenticatedActionClient
  .schema(deleteSnippetSchema)
  .action(async ({ parsedInput, ctx: { user } }) => {
    if (user.role !== 'admin') {
      throw new ActionError('Not authorized')
    }

    const [deleted] = await db
      .delete(snippets)
      .where(eq(snippets.id, parsedInput.snippetId))
      .returning({ id: snippets.id })

    if (!deleted) {
      throw new ActionError('Snippet not found')
    }

    revalidatePath('/snippets')
    revalidatePath(`/snippets/${parsedInput.snippetId}`)
    revalidatePath('/snippets/feed.xml')
    revalidatePath('/admin/snippets')
    revalidatePath('/sitemap.xml')

    return {
      snippetId: deleted.id
    }
  })
