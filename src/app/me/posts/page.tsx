import type { Metadata } from 'next'

import { redirect } from 'next/navigation'

import { getCurrentUser } from '@/lib/auth'
import { getPostsByUserId } from '@/queries/get-posts-by-user-id'

import PostsClient from './page.client'

export const metadata: Metadata = {
  title: 'Content Library'
}

const PostsPage = async () => {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login?redirect=/me/posts')
  }

  const { posts } = await getPostsByUserId(user.id)

  const formattedUser = {
    ...user,
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt)
  }

  const postsWithDates = posts.map((post) => ({
    ...post,
    createdAt: new Date(post.createdAt)
  }))

  return (
    <div className="relative z-10 w-full space-y-6 sm:space-y-8">
      <PostsClient posts={postsWithDates} user={formattedUser} />
    </div>
  )
}

export default PostsPage
