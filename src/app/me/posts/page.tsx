import type { Metadata } from 'next'

import { redirect } from 'next/navigation'

import PageHeader from '@/components/page-header'
import { getCurrentUser } from '@/lib/auth'
import { getPostsByUserId } from '@/queries/get-posts-by-user-id'

import PostsClient from './page.client'

export const metadata: Metadata = {
  title: 'Your posts'
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

  const isAdmin = user.role === 'admin'

  return (
    <div className="mx-auto w-full max-w-3xl rounded-2xl border border-border/40 bg-white/90 p-4 md:p-8 shadow-lg dark:bg-zinc-900/90 my-8">
      {isAdmin && (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <PageHeader
            title="Your posts"
            description="Manage your drafts and published posts. Start a new post anytime!"
            className="mb-0"
          />
          <div className="flex justify-end">
            {/* Write New Post button (client-side) */}
            <div suppressHydrationWarning>
              {/* This will be hydrated by the client, see NewPostButton in header */}
              <div id="new-post-btn-placeholder" />
            </div>
          </div>
        </div>
      )}
      {/* Summary bar placeholder, to be filled in client */}
      <div id="posts-summary-bar" className="mb-4" />
      <PostsClient posts={posts} user={formattedUser} />
    </div>
  )
}

export default PostsPage
