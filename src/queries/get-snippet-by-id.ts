import { and, eq } from 'drizzle-orm'

import { db } from '@/db'
import { snippets } from '@/db/schema'

export const getSnippetById = async (id: string) => {
  const snippet = await db.query.snippets.findFirst({
    where: and(eq(snippets.id, id), eq(snippets.published, true)),
    columns: {
      id: true,
      title: true,
      description: true,
      code: true,
      language: true,
      tags: true,
      createdAt: true,
      updatedAt: true
    },
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          image: true
        }
      }
    }
  })

  return {
    snippet
  }
}
