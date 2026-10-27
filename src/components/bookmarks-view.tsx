'use client'

import {
  ArrowDownWideNarrowIcon,
  BookmarkIcon,
  ClockIcon,
  DownloadIcon,
  HourglassIcon,
  LogInIcon,
  SearchIcon,
  TimerIcon,
  Trash2Icon
} from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import readingTime from 'reading-time'
import { toast } from 'sonner'

import { Frame, FrameBody, StripHeader } from '@/components/frame'
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

const SORT_OPTIONS: Array<{ value: SortOption; label: string; icon: React.ReactNode }> = [
  { value: 'newest', label: 'Newest Added', icon: <ClockIcon className='size-3' /> },
  { value: 'read-time-asc', label: 'Shortest Read', icon: <TimerIcon className='size-3' /> },
  { value: 'read-time-desc', label: 'Longest Read', icon: <HourglassIcon className='size-3' /> },
  { value: 'title-asc', label: 'Title A-Z', icon: <ArrowDownWideNarrowIcon className='size-3' /> }
]

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
    let minutes = 0
    for (const post of allPosts) {
      const stats = readingTime(post.description ?? post.title)
      minutes += Math.ceil(stats.minutes)
    }
    return minutes
  }, [allPosts])

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    return allPosts
      .filter((post) => {
        const matchesSearch =
          search.trim() === '' ||
          post.title.toLowerCase().includes(search.toLowerCase()) ||
          post.description?.toLowerCase().includes(search.toLowerCase())

        const matchesTag =
          !selectedTag || post.tags?.some((t) => t.toLowerCase() === selectedTag.toLowerCase())

        return matchesSearch && matchesTag
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'read-time-asc': {
            return (
              readingTime(a.description ?? a.title).minutes -
              readingTime(b.description ?? b.title).minutes
            )
          }
          case 'read-time-desc': {
            return (
              readingTime(b.description ?? b.title).minutes -
              readingTime(a.description ?? a.title).minutes
            )
          }
          case 'title-asc': {
            return a.title.localeCompare(b.title)
          }
          default: {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          }
        }
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

  let vaultSection: React.ReactNode
  if (isLoaded && allPosts.length === 0) {
    vaultSection = (
      <Frame>
        <StripHeader
          left={<span className='text-foreground font-semibold'>Reading vault // status</span>}
          right={<span>0 saved</span>}
        />
        <FrameBody className='space-y-4 py-16 text-center'>
          <div className='border-border bg-muted/40 mx-auto flex size-12 items-center justify-center border'>
            <BookmarkIcon className='text-muted-foreground size-5' />
          </div>
          <div className='space-y-1'>
            <h2 className='text-foreground text-base font-bold tracking-tight'>
              Reading Vault is Empty
            </h2>
            <p className='text-muted-foreground mx-auto max-w-md text-xs leading-relaxed'>
              Bookmark production architectures, Kubernetes deep-dives, and post-mortems by clicking
              the bookmark icon on any post across the site.
            </p>
          </div>
          <div className='pt-2'>
            <Link
              href='/'
              className='border-border bg-foreground text-background hover:bg-foreground/90 inline-flex cursor-pointer items-center gap-2 border px-4 py-2 font-mono text-xs font-semibold tracking-wider uppercase transition-colors'
            >
              <span>Browse Engineering Articles</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </FrameBody>
      </Frame>
    )
  } else if (filteredPosts.length === 0) {
    vaultSection = (
      <Frame>
        <StripHeader
          left={<span className='text-foreground font-semibold'>Search results</span>}
          right={<span>0 matches</span>}
        />
        <FrameBody className='text-muted-foreground space-y-2 py-12 text-center font-mono text-xs'>
          <p>No saved articles matched your filter: &quot;{search || selectedTag}&quot;</p>
          <button
            type='button'
            onClick={() => {
              setSearch('')
              setSelectedTag(null)
            }}
            className='text-foreground cursor-pointer underline underline-offset-4'
          >
            Reset all filters
          </button>
        </FrameBody>
      </Frame>
    )
  } else {
    vaultSection = (
      <Frame>
        <StripHeader
          left={<span className='text-foreground font-semibold'>Saved archives</span>}
          right={
            <>
              <span>
                {filteredPosts.length} of {allPosts.length} displayed
              </span>
              {confirmClearAll ? (
                <>
                  <button
                    type='button'
                    onClick={handleClearAll}
                    className='text-destructive cursor-pointer font-bold hover:underline'
                  >
                    Confirm clear
                  </button>
                  <button
                    type='button'
                    onClick={() => setConfirmClearAll(false)}
                    className='cursor-pointer hover:underline'
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type='button'
                  onClick={() => setConfirmClearAll(true)}
                  className='hover:text-destructive cursor-pointer transition-colors'
                >
                  Clear vault
                </button>
              )}
            </>
          }
        />

        <div className='divide-border divide-y'>
          {filteredPosts.map((post, idx) => {
            const dateTime = formatPostDate(post.createdAt, {
              format: 'YYYY-MM-DD'
            })
            const readTime = readingTime(post.description ?? post.title).text

            return (
              <HoverMark
                key={post.id}
                label='Read'
                className='group hover:bg-muted/30 flex flex-col justify-between gap-4 p-4 transition-colors sm:flex-row sm:items-center sm:p-5'
              >
                <div className='min-w-0 flex-1 space-y-2'>
                  <div className='text-muted-foreground flex flex-wrap items-center gap-2 font-mono text-[11px]'>
                    <span className='text-foreground font-semibold'>
                      [{String(idx + 1).padStart(2, '0')}/
                      {String(filteredPosts.length).padStart(2, '0')}]
                    </span>
                    <span>&bull;</span>
                    <time dateTime={dateTime}>
                      {formatPostDate(post.createdAt, { relative: true })}
                    </time>
                    <span>&bull;</span>
                    <div className='flex items-center gap-1'>
                      <ClockIcon className='size-3' />
                      <span>{readTime}</span>
                    </div>
                  </div>

                  <Link
                    href={`/posts/${post.id}`}
                    className='text-foreground block text-base font-bold tracking-tight decoration-1 underline-offset-4 transition-colors group-hover:underline'
                  >
                    {post.title}
                  </Link>

                  {post.description && (
                    <p className='text-muted-foreground line-clamp-2 text-xs leading-relaxed'>
                      {post.description}
                    </p>
                  )}

                  {post.tags && post.tags.length > 0 && (
                    <div className='flex flex-wrap gap-1.5 pt-1'>
                      {post.tags.map((tag) => (
                        <button
                          key={tag}
                          type='button'
                          onClick={() => setSelectedTag(tag.toLowerCase())}
                          aria-pressed={selectedTag === tag.toLowerCase()}
                          className='border-border/80 bg-background text-muted-foreground hover:border-foreground hover:text-foreground cursor-pointer border px-1.5 py-0.5 font-mono text-[10px] uppercase transition-colors'
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className='flex shrink-0 items-center gap-2 self-end pt-2 sm:self-center sm:pt-0'>
                  <Link
                    href={`/posts/${post.id}`}
                    className='bg-foreground text-background border-border hover:bg-foreground/90 inline-flex items-center gap-1 border px-3 py-1 font-mono text-xs font-semibold uppercase transition-colors'
                  >
                    <span>Read [→]</span>
                  </Link>
                  <button
                    type='button'
                    onClick={() => toggleBookmark(post)}
                    className='border-border/70 bg-background text-muted-foreground hover:border-destructive hover:text-destructive inline-flex cursor-pointer items-center gap-1 border px-2.5 py-1 font-mono text-xs transition-colors'
                    title='Remove from vault'
                  >
                    <Trash2Icon className='size-3' />
                    <span className='hidden sm:inline'>Delete</span>
                  </button>
                </div>
              </HoverMark>
            )
          })}
        </div>
      </Frame>
    )
  }

  return (
    <div className='space-y-6 sm:space-y-8'>
      {/* GUEST LOCAL STORAGE BANNER */}
      {!userId && (
        <div className='border-border/80 bg-muted/20 flex flex-col items-start justify-between gap-3 border p-4 font-mono text-xs sm:flex-row sm:items-center'>
          <div className='flex items-center gap-2'>
            <span className='bg-foreground size-2 rounded-full' />
            <span className='text-muted-foreground'>
              [OFFLINE_LOCAL_STORAGE] Bookmarks are stored in this browser. Sign in to synchronize
              your vault across devices.
            </span>
          </div>
          <Link
            href='/login?redirect=/bookmarks'
            className='border-border bg-background text-foreground hover:bg-muted inline-flex cursor-pointer items-center gap-1.5 border px-3 py-1 font-mono text-xs whitespace-nowrap transition-colors'
          >
            <LogInIcon className='size-3' />
            <span>Sign In</span>
          </Link>
        </div>
      )}

      {/* METRICS HUD — divided telemetry row */}
      <Frame>
        <StripHeader
          left={<span className='text-foreground font-semibold'>Vault metrics</span>}
          right={<span>{userId ? 'Cloud sync active' : 'Offline // browser storage'}</span>}
        />
        <div className='grid grid-cols-1 sm:grid-cols-3'>
          <div className='border-border space-y-1 border-b p-4 sm:border-r sm:border-b-0'>
            <p className='text-muted-foreground font-mono text-[10px] tracking-widest uppercase'>
              {'// saved_articles'}
            </p>
            <div className='flex items-baseline gap-2'>
              <span className='text-foreground font-mono text-2xl font-bold tracking-tight tabular-nums sm:text-3xl'>
                {allPosts.length}
              </span>
              <span className='text-muted-foreground font-mono text-xs'>items</span>
            </div>
          </div>

          <div className='border-border space-y-1 border-b p-4 sm:border-r sm:border-b-0'>
            <p className='text-muted-foreground font-mono text-[10px] tracking-widest uppercase'>
              {'// est_reading_time'}
            </p>
            <div className='flex items-baseline gap-2'>
              <span className='text-foreground font-mono text-2xl font-bold tracking-tight tabular-nums sm:text-3xl'>
                ~{totalReadingMinutes}
              </span>
              <span className='text-muted-foreground font-mono text-xs'>minutes</span>
            </div>
          </div>

          <div className='space-y-1 p-4'>
            <p className='text-muted-foreground font-mono text-[10px] tracking-widest uppercase'>
              {'// topics_indexed'}
            </p>
            <div className='flex items-baseline gap-2'>
              <span className='text-foreground font-mono text-2xl font-bold tracking-tight tabular-nums sm:text-3xl'>
                {allTags.length}
              </span>
              <span className='text-muted-foreground font-mono text-xs'>domains</span>
            </div>
          </div>
        </div>
      </Frame>

      {/* VAULT SEARCH & CONTROLS */}
      {allPosts.length > 0 && (
        <Frame>
          <StripHeader
            left={<span className='text-foreground font-semibold'>Vault filter // search</span>}
            right={
              <button
                type='button'
                onClick={handleExportMarkdown}
                className='border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground inline-flex cursor-pointer items-center gap-1 border px-2 py-px text-[9px] font-semibold tracking-widest uppercase transition-colors'
                title='Export list as Markdown'
              >
                <DownloadIcon className='size-2.5' aria-hidden />
                <span>Export [.md]</span>
              </button>
            }
          />
          <FrameBody className='space-y-4'>
            <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
              {/* Search input */}
              <div className='relative flex-1'>
                <SearchIcon className='text-muted-foreground absolute top-1/2 left-3 size-3.5 -translate-y-1/2' />
                <input
                  type='text'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder='Filter saved articles by title, keywords...'
                  className='border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:border-foreground h-9 w-full border pr-3 pl-9 font-mono text-xs transition-colors outline-none'
                />
              </div>
            </div>

            {/* Sort chips */}
            <div className='border-border flex flex-wrap items-center gap-1.5 border-t pt-3'>
              <span className='text-muted-foreground mr-1 font-mono text-[10px] tracking-widest uppercase'>
                Sort
              </span>
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type='button'
                  onClick={() => setSortBy(option.value)}
                  aria-pressed={sortBy === option.value}
                  className={cn(
                    'inline-flex cursor-pointer items-center gap-1.5 border px-2 py-1 font-mono text-[10px] tracking-wider uppercase transition-colors',
                    sortBy === option.value
                      ? 'border-foreground bg-foreground text-background font-semibold'
                      : 'border-border/70 bg-background text-muted-foreground hover:border-foreground hover:text-foreground'
                  )}
                >
                  {option.icon}
                  {option.label}
                </button>
              ))}
            </div>

            {/* Tag Filter Pills */}
            {allTags.length > 0 && (
              <div className='flex flex-wrap items-center gap-1.5 pt-1'>
                <span className='text-muted-foreground mr-1 font-mono text-[10px] uppercase'>
                  TAGS:
                </span>
                <button
                  type='button'
                  onClick={() => setSelectedTag(null)}
                  className={cn(
                    'cursor-pointer border px-2 py-0.5 font-mono text-[11px] uppercase transition-colors',
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
                    type='button'
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    className={cn(
                      'cursor-pointer border px-2 py-0.5 font-mono text-[11px] uppercase transition-colors',
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
      {vaultSection}
    </div>
  )
}

export default BookmarksView
