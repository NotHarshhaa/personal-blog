import { NextResponse } from 'next/server'

import { getPosts } from '@/queries/get-posts'

export async function GET() {
  const { posts } = await getPosts()
  // Only return minimal fields for search
  return NextResponse.json({
    posts: posts.map((post) => ({
      id: post.id,
      title: post.title,
      description: post.description,
      createdAt: post.createdAt,
      user: post.user,
      likes: post.likes
    }))
  })
}
