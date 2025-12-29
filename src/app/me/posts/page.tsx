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

  // Convert dates for client component
  const postsWithDates = posts.map((post) => ({
    ...post,
    createdAt: new Date(post.createdAt)
  }))

  const isAdmin = user.role === 'admin'

  return (
    <>
      <PageHeader
        title="Your posts"
        description={isAdmin ? "Manage your drafts and published posts. Start a new post anytime!" : "All the posts you have liked will appear here."}
      />
      <div className="mx-auto w-full max-w-4xl rounded-2xl border border-border/40 bg-white/90 p-5 sm:p-8 shadow-lg dark:bg-zinc-900/90 relative overflow-hidden">
        {/* Decorative accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary/60 to-transparent" />

        {isAdmin && (
          <div className="flex justify-end mb-6">
            {/* Write New Post button (client-side) */}
            <div suppressHydrationWarning>
              {/* This will be hydrated by the client, see NewPostButton in header */}
              <div id="new-post-btn-placeholder" />
            </div>
          </div>
        )}
        {/* Summary bar placeholder, to be filled in client */}
        <div id="posts-summary-bar" className="mb-6" />
        <PostsClient posts={postsWithDates} user={formattedUser} />
      </div>
    </>
  )
}

export default PostsPage
