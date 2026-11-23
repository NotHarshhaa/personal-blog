import type { Metadata } from 'next'

import { redirect } from 'next/navigation'

import { getCurrentUser } from '@/lib/auth'
import { getPostsByUserId } from '@/queries/get-posts-by-user-id'
import { getPostsLikedByUserId } from '@/queries/get-posts-liked-by-user-id'

import PostsClient from './page.client'

export const metadata: Metadata = {
  title: 'Content Library'
}

const PostsPage = async () => {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login?redirect=/me/posts')
  }

  // Admins manage their own posts; regular users see the posts they liked.
  const { posts } =
    user.role === 'admin' ? await getPostsByUserId(user.id) : await getPostsLikedByUserId(user.id)

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
