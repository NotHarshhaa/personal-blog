import type { Metadata } from 'next'

import { BookmarkIcon } from 'lucide-react'

import BookmarksView from '@/components/bookmarks-view'
import { Frame, FrameBody, FrameHeader } from '@/components/frame'
import { getCurrentUser } from '@/lib/auth'
import { getUserBookmarks } from '@/queries/get-user-bookmarks'

export const metadata: Metadata = {
  title: 'Bookmarks & Reading Vault',
  description: 'Saved DevOps, cloud architecture, and AI engineering tutorials.'
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
        <FrameHeader label="LIBRARY // ARCHIVAL VAULT">
          <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-1 border border-border/80 bg-muted/30 px-1.5 py-0.5">
              <span className="size-1.5 rounded-full bg-foreground" />
              <span>SYNC: {user ? 'CLOUD_CONNECTED' : 'LOCAL_STORAGE'}</span>
            </span>
          </div>
        </FrameHeader>
        <FrameBody className="space-y-3">
          <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
            <BookmarkIcon className="size-3.5 text-foreground" />
            <span>PERSONAL READING ARCHIVE</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Bookmarks & Reading Vault
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Keep track of architectural guides, production playbooks, and systems deep
            dives. Saved articles remain instantly accessible offline in your browser and
            sync across devices when signed in.
          </p>
        </FrameBody>
      </Frame>

      <BookmarksView initialPosts={initialPosts} userId={user?.id ?? null} />
    </div>
  )
}

export default BookmarksPage
