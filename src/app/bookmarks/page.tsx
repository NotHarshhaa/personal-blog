import type { Metadata } from 'next'

import { BookmarkIcon, LogInIcon } from 'lucide-react'
import Link from 'next/link'

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

  if (!user) {
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

        <Frame>
          <FrameHeader label="Authentication Required" />
          <FrameBody className="py-14 text-center">
            <div className="mx-auto flex size-12 items-center justify-center border border-border bg-muted/40">
              <BookmarkIcon className="size-5 text-muted-foreground" />
            </div>
            <h2 className="mt-4 text-base font-semibold tracking-tight text-foreground">
              Sign in to view your saved bookmarks
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-muted-foreground">
              Bookmark technical articles, architecture deep-dives, and read them
              anytime across all your devices.
            </p>
            <div className="mt-6">
              <Link
                href="/login?redirect=/bookmarks"
                className="inline-flex items-center gap-2 border border-border bg-foreground px-5 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-background transition-colors hover:bg-foreground/90 cursor-pointer"
              >
                <LogInIcon className="size-3.5" />
                <span>Sign In to Continue</span>
              </Link>
            </div>
          </FrameBody>
        </Frame>
      </div>
    )
  }

  const { posts } = await getUserBookmarks(user.id)
  const initialPosts = posts.map((p) => ({
    ...p,
    createdAt: new Date(p.createdAt)
  }))

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

      <BookmarksView initialPosts={initialPosts} userId={user.id} />
    </div>
  )
}

export default BookmarksPage
