import { desc, eq } from 'drizzle-orm'

import { db } from '@/db'
import { snippets } from '@/db/schema'

export const getSnippets = async () => {
  const result = await db.query.snippets.findMany({
    where: eq(snippets.published, true),
    columns: {
      id: true,
      title: true,
      description: true,
      code: true,
      language: true,
      tags: true,
      createdAt: true
    },
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          image: true
        }
      }
    },
    orderBy: desc(snippets.createdAt)
  })

  return {
    snippets: result
  }
}
