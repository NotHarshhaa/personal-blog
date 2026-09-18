'use client'

import { BookmarkIcon, ClockIcon, Trash2Icon } from 'lucide-react'
import Link from 'next/link'
import readingTime from 'reading-time'

import { Frame, FrameBody, FrameHeader } from '@/components/frame'
import { HoverMark } from '@/components/hover-mark'
import { useBookmarks } from '@/hooks/use-bookmarks'
import { formatPostDate } from '@/utils/format-post-date'

type BookmarkedPost = {
  id: string
  title: string
  description?: string | null
  createdAt: Date | string
  tags?: string[]
}

type BookmarksViewProps = {
  initialPosts?: BookmarkedPost[]
  userId?: string | null
}

const EMPTY_INITIAL_POSTS: BookmarkedPost[] = []

export const BookmarksView = ({
  initialPosts = EMPTY_INITIAL_POSTS,
  userId
}: BookmarksViewProps) => {
  const { bookmarks: localBookmarks, toggleBookmark, isLoaded } = useBookmarks(userId)

  // Merge server initial posts with local storage bookmarks
  const mergedMap = new Map<string, BookmarkedPost>()

  // Add initial server posts
  for (const post of initialPosts) {
    mergedMap.set(post.id, post)
  }

  // Add/override with local bookmarks
  for (const lb of localBookmarks) {
    mergedMap.set(lb.id, {
      id: lb.id,
      title: lb.title,
      description: lb.description,
      createdAt: lb.createdAt,
      tags: lb.tags
    })
  }

  const posts = Array.from(mergedMap.values())

  if (isLoaded && posts.length === 0) {
    return (
      <Frame>
        <FrameHeader label="Reading List">
          <span className="font-mono text-xs text-muted-foreground">0 SAVED</span>
        </FrameHeader>
        <FrameBody className="py-16 text-center">
          <div className="mx-auto flex size-12 items-center justify-center border border-border bg-muted/40">
            <BookmarkIcon className="size-5 text-muted-foreground" />
          </div>
          <h2 className="mt-4 text-base font-semibold tracking-tight">
            No saved articles yet
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-muted-foreground">
            Save deep dives and tutorials to your reading list by clicking the
            Bookmark button on any post.
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center border border-border bg-background px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-foreground transition-colors hover:border-foreground hover:bg-muted"
            >
              Browse Articles
            </Link>
          </div>
        </FrameBody>
      </Frame>
    )
  }

  return (
    <Frame>
      <FrameHeader label="Reading List">
        <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <BookmarkIcon className="size-3.5" />
          <span>
            {posts.length} {posts.length === 1 ? 'ARTICLE' : 'ARTICLES'}
          </span>
        </div>
      </FrameHeader>
      <div className="divide-y divide-border">
        {posts.map((post) => {
          const dateTime = formatPostDate(post.createdAt, {
            format: 'YYYY-MM-DD'
          })
          const readTime = readingTime(post.description ?? post.title).text

          return (
            <HoverMark
              key={post.id}
              label="Read"
              className="group flex flex-col justify-between gap-3 p-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:p-5"
            >
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted-foreground">
                  <time dateTime={dateTime}>
                    {formatPostDate(post.createdAt, { relative: true })}
                  </time>
                  <span aria-hidden>·</span>
                  <div className="flex items-center gap-1">
                    <ClockIcon className="size-3" />
                    <span>{readTime}</span>
                  </div>
                </div>

                <Link
                  href={`/posts/${post.id}`}
                  className="block text-base font-medium tracking-tight transition-colors group-hover:text-foreground"
                >
                  {post.title}
                </Link>

                {post.description && (
                  <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {post.description}
                  </p>
                )}

                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="border border-border/80 bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground uppercase"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex shrink-0 items-center justify-end pt-2 sm:pt-0">
                <button
                  type="button"
                  onClick={() => toggleBookmark(post)}
                  className="inline-flex items-center gap-1.5 border border-border/70 bg-background px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-destructive hover:text-destructive cursor-pointer"
                  title="Remove from reading list"
                >
                  <Trash2Icon className="size-3" />
                  <span className="font-mono text-[11px] uppercase">Remove</span>
                </button>
              </div>
            </HoverMark>
          )
        })}
      </div>
    </Frame>
  )
}

export default BookmarksView
