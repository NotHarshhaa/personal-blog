'use client'

import {
  ArrowUpDown,
  BookmarkIcon,
  ClockIcon,
  DownloadIcon,
  LogInIcon,
  SearchIcon,
  Trash2Icon
} from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import readingTime from 'reading-time'
import { toast } from 'sonner'

import { Frame, FrameBody, FrameHeader } from '@/components/frame'
import { HoverMark } from '@/components/hover-mark'
import { useBookmarks } from '@/hooks/use-bookmarks'
import { cn } from '@/lib/utils'
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

type SortOption = 'newest' | 'read-time-asc' | 'read-time-desc' | 'title-asc'

const EMPTY_INITIAL_POSTS: BookmarkedPost[] = []

export const BookmarksView = ({
  initialPosts = EMPTY_INITIAL_POSTS,
  userId
}: BookmarksViewProps) => {
  const { bookmarks: localBookmarks, toggleBookmark, isLoaded } = useBookmarks(userId)
  const [search, setSearch] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [confirmClearAll, setConfirmClearAll] = useState(false)

  // Merge server initial posts with local storage bookmarks
  const mergedMap = useMemo(() => {
    const map = new Map<string, BookmarkedPost>()
    for (const post of initialPosts) {
      map.set(post.id, post)
    }
    for (const lb of localBookmarks) {
      map.set(lb.id, {
        id: lb.id,
        title: lb.title,
        description: lb.description,
        createdAt: lb.createdAt,
        tags: lb.tags
      })
    }
    return map
  }, [initialPosts, localBookmarks])

  const allPosts = useMemo(() => Array.from(mergedMap.values()), [mergedMap])

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    for (const post of allPosts) {
      if (post.tags) {
        for (const tag of post.tags) {
          tagSet.add(tag.toLowerCase())
        }
      }
    }
    return Array.from(tagSet)
  }, [allPosts])

  // Total reading time calculation
  const totalReadingMinutes = useMemo(() => {
    return allPosts.reduce((acc, p) => {
      const stats = readingTime(p.description ?? p.title)
      return acc + Math.ceil(stats.minutes)
    }, 0)
  }, [allPosts])

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    return allPosts
      .filter((post) => {
        const matchesSearch =
          search.trim() === '' ||
          post.title.toLowerCase().includes(search.toLowerCase()) ||
          (post.description && post.description.toLowerCase().includes(search.toLowerCase()))

        const matchesTag =
          !selectedTag ||
          (post.tags && post.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase()))

        return matchesSearch && matchesTag
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        }
        if (sortBy === 'read-time-asc') {
          const timeA = readingTime(a.description ?? a.title).minutes
          const timeB = readingTime(b.description ?? b.title).minutes
          return timeA - timeB
        }
        if (sortBy === 'read-time-desc') {
          const timeA = readingTime(a.description ?? a.title).minutes
          const timeB = readingTime(b.description ?? b.title).minutes
          return timeB - timeA
        }
        if (sortBy === 'title-asc') {
          return a.title.localeCompare(b.title)
        }
        return 0
      })
  }, [allPosts, search, selectedTag, sortBy])

  const handleExportMarkdown = () => {
    if (allPosts.length === 0) return
    const content = [
      `# DevOps & AI Reading Vault Export`,
      `*Generated on ${new Date().toLocaleDateString()} — ${allPosts.length} saved articles*\n`,
      ...allPosts.map((p, idx) => {
        return `${idx + 1}. [${p.title}](${globalThis.location.origin}/posts/${p.id})\n   - Saved: ${new Date(p.createdAt).toLocaleDateString()}\n   - Topics: ${(p.tags ?? []).join(', ')}`
      })
    ].join('\n')

    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reading-vault-${new Date().toISOString().slice(0, 10)}.md`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Reading vault exported as Markdown!')
  }

  const handleClearAll = () => {
    for (const post of allPosts) {
      toggleBookmark(post)
    }
    setConfirmClearAll(false)
    toast.success('All bookmarks cleared from vault')
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* GUEST LOCAL STORAGE BANNER */}
      {!userId && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-border/80 bg-muted/20 p-4 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-foreground" />
            <span className="text-muted-foreground">
              [OFFLINE_LOCAL_STORAGE] Bookmarks are stored in this browser. Sign in to synchronize your vault across devices.
            </span>
          </div>
          <Link
            href="/login?redirect=/bookmarks"
            className="inline-flex items-center gap-1.5 border border-border bg-background px-3 py-1 font-mono text-xs text-foreground hover:bg-muted transition-colors whitespace-nowrap cursor-pointer"
          >
            <LogInIcon className="size-3" />
            <span>Sign In</span>
          </Link>
        </div>
      )}

      {/* METRICS HUD */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="border border-border bg-card p-4 space-y-1">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            // SAVED_ARTICLES
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {allPosts.length}
            </span>
            <span className="font-mono text-xs text-muted-foreground">ITEMS</span>
          </div>
        </div>

        <div className="border border-border bg-card p-4 space-y-1">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            // EST_READING_TIME
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              ~{totalReadingMinutes}
            </span>
            <span className="font-mono text-xs text-muted-foreground">MINUTES</span>
          </div>
        </div>

        <div className="border border-border bg-card p-4 space-y-1">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            // TOPICS_INDEXED
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {allTags.length}
            </span>
            <span className="font-mono text-xs text-muted-foreground">DOMAINS</span>
          </div>
        </div>
      </div>

      {/* VAULT SEARCH & CONTROLS */}
      {allPosts.length > 0 && (
        <Frame>
          <FrameHeader label="VAULT FILTER & SEARCH">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportMarkdown}
                className="inline-flex items-center gap-1.5 border border-border bg-background px-2.5 py-1 font-mono text-[11px] text-muted-foreground hover:border-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Export list as Markdown"
              >
                <DownloadIcon className="size-3" />
                <span className="hidden sm:inline">Export [.md]</span>
              </button>
            </div>
          </FrameHeader>
          <FrameBody className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* Search input */}
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter saved articles by title, keywords..."
                  className="h-9 w-full border border-border bg-background pl-9 pr-3 font-mono text-xs text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-foreground"
                />
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="size-3.5 text-muted-foreground shrink-0" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="h-9 border border-border bg-background px-2.5 font-mono text-xs text-foreground outline-none cursor-pointer focus:border-foreground"
                >
                  <option value="newest">Sort: Newest Added</option>
                  <option value="read-time-asc">Sort: Shortest Read</option>
                  <option value="read-time-desc">Sort: Longest Read</option>
                  <option value="title-asc">Sort: Title (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Tag Filter Pills */}
            {allTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="font-mono text-[10px] text-muted-foreground uppercase mr-1">
                  TAGS:
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedTag(null)}
                  className={cn(
                    'border px-2 py-0.5 font-mono text-[11px] uppercase transition-colors cursor-pointer',
                    selectedTag === null
                      ? 'border-foreground bg-foreground text-background font-semibold'
                      : 'border-border bg-background text-muted-foreground hover:border-foreground'
                  )}
                >
                  ALL ({allPosts.length})
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    className={cn(
                      'border px-2 py-0.5 font-mono text-[11px] uppercase transition-colors cursor-pointer',
                      selectedTag === tag
                        ? 'border-foreground bg-foreground text-background font-semibold'
                        : 'border-border bg-background text-muted-foreground hover:border-foreground'
                    )}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </FrameBody>
        </Frame>
      )}

      {/* ARTICLE LIST OR EMPTY STATE */}
      {isLoaded && allPosts.length === 0 ? (
        <Frame>
          <FrameHeader label="READING VAULT // STATUS">
            <span className="font-mono text-xs text-muted-foreground">0 SAVED</span>
          </FrameHeader>
          <FrameBody className="py-16 text-center space-y-4">
            <div className="mx-auto flex size-12 items-center justify-center border border-border bg-muted/40">
              <BookmarkIcon className="size-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold tracking-tight text-foreground">
                Reading Vault is Empty
              </h2>
              <p className="mx-auto max-w-md text-xs leading-relaxed text-muted-foreground">
                Bookmark production architectures, Kubernetes deep-dives, and post-mortems
                by clicking the bookmark icon on any post across the site.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 border border-border bg-foreground px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-background hover:bg-foreground/90 transition-colors"
              >
                <span>Browse Engineering Articles</span>
                <span>→</span>
              </Link>
            </div>
          </FrameBody>
        </Frame>
      ) : filteredPosts.length === 0 ? (
        <Frame>
          <FrameHeader label="SEARCH RESULTS" />
          <FrameBody className="py-12 text-center text-muted-foreground font-mono text-xs space-y-2">
            <p>No saved articles matched your filter: "{search || selectedTag}"</p>
            <button
              type="button"
              onClick={() => {
                setSearch('')
                setSelectedTag(null)
              }}
              className="text-foreground underline underline-offset-4 cursor-pointer"
            >
              Reset all filters
            </button>
          </FrameBody>
        </Frame>
      ) : (
        <Frame>
          <FrameHeader label="SAVED ARCHIVES">
            <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
              <span>
                {filteredPosts.length} OF {allPosts.length} DISPLAYED
              </span>
              {confirmClearAll ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="text-destructive font-bold hover:underline cursor-pointer"
                  >
                    [Confirm Clear]
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClearAll(false)}
                    className="text-muted-foreground hover:underline cursor-pointer"
                  >
                    [Cancel]
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmClearAll(true)}
                  className="hover:text-destructive transition-colors cursor-pointer"
                >
                  [Clear Vault]
                </button>
              )}
            </div>
          </FrameHeader>

          <div className="divide-y divide-border">
            {filteredPosts.map((post, idx) => {
              const dateTime = formatPostDate(post.createdAt, {
                format: 'YYYY-MM-DD'
              })
              const readTime = readingTime(post.description ?? post.title).text

              return (
                <HoverMark
                  key={post.id}
                  label="Read"
                  className="group flex flex-col justify-between gap-4 p-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:p-5"
                >
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        [{String(idx + 1).padStart(2, '0')}/{String(filteredPosts.length).padStart(2, '0')}]
                      </span>
                      <span>•</span>
                      <time dateTime={dateTime}>
                        {formatPostDate(post.createdAt, { relative: true })}
                      </time>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <ClockIcon className="size-3" />
                        <span>{readTime}</span>
                      </div>
                    </div>

                    <Link
                      href={`/posts/${post.id}`}
                      className="block text-base font-bold tracking-tight text-foreground transition-colors group-hover:underline decoration-1 underline-offset-4"
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
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            onClick={(e) => {
                              e.preventDefault()
                              setSelectedTag(tag.toLowerCase())
                            }}
                            className="border border-border/80 bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground uppercase cursor-pointer hover:border-foreground hover:text-foreground transition-colors"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-2 pt-2 sm:pt-0 self-end sm:self-center">
                    <Link
                      href={`/posts/${post.id}`}
                      className="inline-flex items-center gap-1 border border-border bg-foreground px-3 py-1 font-mono text-xs font-semibold uppercase text-background hover:bg-foreground/90 transition-colors"
                    >
                      <span>Read [→]</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleBookmark(post)}
                      className="inline-flex items-center gap-1 border border-border/70 bg-background px-2.5 py-1 font-mono text-xs text-muted-foreground transition-colors hover:border-destructive hover:text-destructive cursor-pointer"
                      title="Remove from vault"
                    >
                      <Trash2Icon className="size-3" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </HoverMark>
              )
            })}
          </div>
        </Frame>
      )}
    </div>
  )
}

export default BookmarksView
