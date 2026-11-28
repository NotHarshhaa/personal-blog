'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

import { db } from '@/db'
import { snippets } from '@/db/schema'
import { ActionError, authenticatedActionClient } from '@/lib/safe-action'

import { updateSnippetSchema } from './schema'

export const updateSnippetAction = authenticatedActionClient
  .schema(updateSnippetSchema)
  .action(async ({ parsedInput, ctx: { user } }) => {
    if (user.role !== 'admin') {
      throw new ActionError('Not authorized')
    }

    const { snippetId, ...values } = parsedInput

    const [snippet] = await db
      .update(snippets)
      .set({
        title: values.title,
        description: values.description ?? null,
        code: values.code,
        language: values.language,
        tags: values.tags,
        published: values.published,
        updatedAt: new Date()
      })
      .where(eq(snippets.id, snippetId))
      .returning({
        id: snippets.id
      })

    if (!snippet) {
      throw new ActionError('Snippet not found')
    }

    revalidatePath('/snippets')
    revalidatePath(`/snippets/${snippetId}`)
    revalidatePath('/snippets/feed.xml')
    revalidatePath('/admin/snippets')
    revalidatePath('/sitemap.xml')

    return {
      snippetId: snippet.id
    }
  })
