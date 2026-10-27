import type { Metadata } from 'next'

import { BookmarkIcon } from 'lucide-react'

import BookmarksView from '@/components/bookmarks-view'
import { Frame, FrameBody, StripHeader } from '@/components/frame'
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
    <div className='relative z-10 w-full space-y-6 sm:space-y-8'>
      <Frame as='header'>
        <StripHeader
          left={
            <>
              <BookmarkIcon className='text-foreground size-3' aria-hidden />
              <span className='text-foreground font-semibold'>Library // Reading vault</span>
              <span className='hidden sm:inline'>· Personal reading archive</span>
            </>
          }
          right={
            <span className='inline-flex items-center gap-1.5'>
              <span className='bg-foreground size-1.5 rounded-full' aria-hidden />
              <span>Sync: {user ? 'cloud_connected' : 'local_storage'}</span>
            </span>
          }
        />
        <FrameBody className='space-y-2'>
          <h1 className='font-heading text-foreground text-3xl font-bold tracking-tight sm:text-4xl'>
            Bookmarks &amp; Reading Vault
          </h1>
          <p className='text-muted-foreground max-w-3xl text-sm leading-relaxed sm:text-base'>
            Keep track of architectural guides, production playbooks, and systems deep dives. Saved
            articles remain instantly accessible offline in your browser and sync across devices
            when signed in.
          </p>
        </FrameBody>
      </Frame>

      <BookmarksView initialPosts={initialPosts} userId={user?.id ?? null} />
    </div>
  )
}

export default BookmarksPage
