import { and, desc, eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

import { db } from '@/db'
import { posts } from '@/db/schema'

export const dynamic = 'force-dynamic'

export const GET = async () => {
  try {
    const recentPosts = await db.query.posts.findMany({
      where: and(eq(posts.published, true), eq(posts.visibility, 'public')),
      columns: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        tags: true
      },
      orderBy: desc(posts.createdAt),
      limit: 8
    })

    const notifications = recentPosts.map((post) => ({
      id: post.id,
      postId: post.id,
      title: post.title,
      description:
        post.description ?? 'A new tutorial has been published on the blog.',
      createdAt: post.createdAt.toISOString()
    }))

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ notifications: [] }, { status: 500 })
  }
}
