import type { Metadata } from 'next'

import BookmarksView from '@/components/bookmarks-view'
import { Frame, FrameBody, FrameHeader } from '@/components/frame'
import { getCurrentUser } from '@/lib/auth'
import { getUserBookmarks } from '@/queries/get-user-bookmarks'

export const metadata: Metadata = {
  title: 'Bookmarks & Read Later',
  description: 'Your saved DevOps, cloud architecture, and AI engineering tutorials.'
}

const BookmarksPage = async () => {
  const user = await getCurrentUser()

  let initialPosts: Array<{
    id: string
    title: string
    description?: string | null
    createdAt: Date
    tags?: string[]
  }> = []

  if (user) {
    const { posts } = await getUserBookmarks(user.id)
    initialPosts = posts.map((p) => ({
      ...p,
      createdAt: new Date(p.createdAt)
    }))
  }

  return (
    <div className="relative z-10 w-full space-y-6 sm:space-y-8">
      <Frame as="header">
        <FrameHeader label="Library" />
        <FrameBody className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Bookmarks & Read Later
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Keep track of architectural guides, production playbooks, and deep
            dives. Saved articles remain accessible across all your devices.
          </p>
        </FrameBody>
      </Frame>

      <BookmarksView initialPosts={initialPosts} userId={user?.id} />
    </div>
  )
}

export default BookmarksPage
