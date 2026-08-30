import type { NextRequest } from 'next/server'

import { and, eq, sql } from 'drizzle-orm'
import { NextResponse } from 'next/server'

import { db } from '@/db'
import { posts } from '@/db/schema'
import { getBaselineEngagement, getDisplayViewCount } from '@/utils/get-seeded-view-count'

const getPost = async (id: string) => {
  return db.query.posts.findFirst({
    where: eq(posts.id, id),
    columns: {
      id: true,
      views: true,
      baselineViews: true,
      createdAt: true,
      published: true
    }
  })
}

const getHybridViews = (post: {
  id: string
  views: number
  baselineViews: number
  createdAt: Date
  published: boolean
}) => {
  const baselineViews = getBaselineEngagement(post.id, post.createdAt).baselineViews
  return getDisplayViewCount(post.views, baselineViews, post.published)
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const post = await getPost(id)

    if (!post?.published) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json({ views: getHybridViews(post) })
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

    if (!post?.published) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const [updated] = await db
      .update(posts)
      .set({ views: sql`${posts.views} + 1` })
      .where(and(eq(posts.id, id), eq(posts.published, true)))
      .returning({ views: posts.views })

    if (!updated) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const baselineViews = getBaselineEngagement(post.id, post.createdAt).baselineViews
    return NextResponse.json({
      views: getDisplayViewCount(updated.views, baselineViews, true)
    })
  } catch (error) {
    console.error('Error tracking view:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
