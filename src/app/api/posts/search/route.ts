import { sql } from 'drizzle-orm'
import { NextResponse } from 'next/server'

import { db } from '@/db'
import { getPosts } from '@/queries/get-posts'

type SearchPost = {
  id: string
  title: string
  description: string | null
  createdAt: string
  tags: string[]
  score?: number
  user?: {
    id: string
    name: string
    image?: string | null
  }
}

type SearchRow = {
  id: string
  title: string
  description: string | null
  created_at: Date
  tags: string[]
  author_id: string
  author_name: string
  author_image: string | null
  score: number
}

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get('q')?.trim() ?? ''

  // No query: full minimal list for client-side filtering
  if (query.length < 2) {
    const { posts } = await getPosts()
    return NextResponse.json({
      posts: posts.map((post): SearchPost => ({
        id: post.id,
        title: post.title,
        description: post.description,
        createdAt: new Date(post.createdAt).toISOString(),
        tags: post.tags,
        user: post.user
      }))
    })
  }

  // Server-side PostgreSQL full-text search (tsvector + GIN index, ranked with ts_rank)
  try {
    const result = await db.execute<SearchRow>(sql`
      SELECT p.id, p.title, p.description, p.created_at, p.tags,
             u.id AS author_id, u.name AS author_name, u.image AS author_image,
             ts_rank(p.search_vector, websearch_to_tsquery('english', ${query})) AS score
      FROM post p
      JOIN "user" u ON u.id = p.author_id
      WHERE p.published
        AND p.visibility = 'public'
        AND p.search_vector @@ websearch_to_tsquery('english', ${query})
      ORDER BY score DESC
      LIMIT 10
    `)

    return NextResponse.json({
      posts: result.rows.map((row): SearchPost => ({
        id: row.id,
        title: row.title,
        description: row.description,
        createdAt: new Date(row.created_at).toISOString(),
        tags: row.tags,
        score: row.score,
        user: {
          id: row.author_id,
          name: row.author_name,
          image: row.author_image
        }
      }))
    })
  } catch {
    // Fallback: full list for client-side filtering
    const { posts } = await getPosts()
    return NextResponse.json({
      posts: posts.map((post): SearchPost => ({
        id: post.id,
        title: post.title,
        description: post.description,
        createdAt: new Date(post.createdAt).toISOString(),
        tags: post.tags,
        user: post.user
      }))
    })
  }
}
