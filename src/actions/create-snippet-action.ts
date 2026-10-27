'use server'

import { revalidatePath } from 'next/cache'

import { db } from '@/db'
import { snippets } from '@/db/schema'
import { authenticatedActionClient } from '@/lib/safe-action'

import { createSnippetSchema } from './schema'

export const createSnippetAction = authenticatedActionClient
  .schema(createSnippetSchema)
  .action(async ({ parsedInput, ctx: { user } }) => {
    if (user.role !== 'admin') {
      throw new Error('Not authorized')
    }

    const [snippet] = await db
      .insert(snippets)
      .values({
        authorId: user.id,
        title: parsedInput.title,
        description: parsedInput.description ?? null,
        code: parsedInput.code,
        language: parsedInput.language,
        tags: parsedInput.tags,
        published: parsedInput.published
      })
      .returning({
        id: snippets.id
      })

    revalidatePath('/snippets')
    revalidatePath('/admin/snippets')

    return {
      snippetId: snippet?.id
    }
  })
