import { and, eq } from 'drizzle-orm'

import { db } from '@/db'
import { snippets } from '@/db/schema'

export const dynamic = 'force-dynamic'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const snippet = await db.query.snippets.findFirst({
    where: and(eq(snippets.id, id), eq(snippets.published, true)),
    columns: {
      code: true
    }
  })

  if (!snippet) {
    return new Response('# snippet not found or not published\n', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff'
      }
    })
  }

  const body = snippet.code.endsWith('\n') ? snippet.code : `${snippet.code}\n`

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
    }
  })
}
