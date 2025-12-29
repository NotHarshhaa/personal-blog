import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { posts } from '@/db/schema'
import { eq } from 'drizzle-orm'

// Simple in-memory store for views (in production, use Redis or database)
// Note: This resets on server restart. For production, consider using:
// - Redis for distributed caching
// - Database table for persistent storage
// - Vercel KV or similar service
const viewsStore = new Map<string, number>()

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verify post exists
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, id),
      columns: { id: true }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const views = viewsStore.get(id) || 0
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

    // Verify post exists
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, id),
      columns: { id: true }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Increment views
    const currentViews = viewsStore.get(id) || 0
    const newViews = currentViews + 1
    viewsStore.set(id, newViews)

    return NextResponse.json({ views: newViews })
  } catch (error) {
    console.error('Error tracking view:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

