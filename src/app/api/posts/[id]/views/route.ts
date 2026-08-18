import { eq, sql } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { db } from '@/db'
import { posts } from '@/db/schema'
import { getSeededViewCount } from '@/utils/get-seeded-view-count'

const getPost = async (id: string) => {
  return db.query.posts.findFirst({
    where: eq(posts.id, id),
    columns: {
      id: true,
      views: true,
      createdAt: true,
      published: true
    }
  })
}

const ensureSeededViews = async (post: {
  id: string
  views: number
  createdAt: Date
}) => {
  if (post.views > 0) {
    return post.views
  }

  const views = getSeededViewCount(post.id, post.createdAt)

  await db.update(posts).set({ views }).where(eq(posts.id, post.id))

  return views
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const post = await getPost(id)

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const views = await ensureSeededViews(post)

    return NextResponse.json({ views })
  } catch (error) {
    console.error('Error fetching views:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const post = await getPost(id)

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const currentViews = await ensureSeededViews(post)
    const [updated] = await db
      .update(posts)
      .set({ views: sql`${posts.views} + 1` })
      .where(eq(posts.id, id))
      .returning({ views: posts.views })

    return NextResponse.json({ views: updated?.views ?? currentViews + 1 })
  } catch (error) {
    console.error('Error tracking view:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
