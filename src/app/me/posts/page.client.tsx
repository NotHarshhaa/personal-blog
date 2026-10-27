'use client'

import type { User } from '@/db/schema'

import {
  ArrowUpDown,
  Clock,
  Eye,
  FileCheck2,
  FileEdit,
  FolderOpen,
  Heart,
  Inbox,
  Loader2Icon,
  Search,
  Trash2Icon,
  X
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAction } from 'next-safe-action/hooks'
import { useMemo, useState } from 'react'

import { deleteDraftPostsAction } from '@/actions/delete-draft-posts-action'
import { Frame, FrameBody, StripHeader } from '@/components/frame'
import NewPostButton from '@/components/new-post-button'
import PostCard, { type PostCardProps } from '@/components/post-card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  buttonVariants,
  toast
} from '@/components/ui'
import { cn } from '@/utils'

type SortOption = 'newest' | 'views' | 'popular' | 'title'
type TabOption = 'published' | 'drafts' | 'all'

type ContentProps = {
  posts: Array<PostCardProps['post']>
  user: User
}

const getEmptyStateTitle = (search: string, activeTab: TabOption): string => {
  if (search) return `No articles match "${search}"`
  if (activeTab === 'drafts') return 'No drafts in progress'
  if (activeTab === 'published') return 'No published articles yet'
  return 'No articles found in this view'
}

const getEmptyStateDescription = (search: string, activeTab: TabOption): string => {
  if (search) return 'Try searching with a different term or reset your search filter.'
  if (activeTab === 'drafts')
    return 'Start a new draft to draft out thoughts, technical tutorials, and architecture notes.'
  return 'Create and publish your first technical article for the community!'
}

const sortLabels: Record<SortOption, { label: string; icon: React.ReactNode }> = {
  newest: { label: 'Newest First', icon: <Clock className='size-3' /> },
  views: { label: 'Most Views', icon: <Eye className='size-3' /> },
  popular: { label: 'Most Liked', icon: <Heart className='size-3' /> },
  title: { label: 'Alphabetical', icon: <ArrowUpDown className='size-3' /> }
}

type MetricsRowProps = {
  activeTab: TabOption
  onTabChange: (tab: TabOption) => void
  publishedCount: number
  draftCount: number
  totalViews: number
  totalLikes: number
}

const MetricsRow = ({
  activeTab,
  onTabChange,
  publishedCount,
  draftCount,
  totalViews,
  totalLikes
}: MetricsRowProps) => (
  <div className='border-border grid grid-cols-2 border sm:grid-cols-4'>
    {/* Published Tile */}
    <button
      type='button'
      onClick={() => onTabChange('published')}
      className={cn(
        'group border-border flex cursor-pointer flex-col justify-between p-3.5 text-left transition-colors duration-150 sm:border-r',
        activeTab === 'published' ? 'bg-muted/50' : 'hover:bg-muted/20'
      )}
    >
      <span className='text-muted-foreground flex items-center justify-between font-mono text-[10px] tracking-widest uppercase'>
        Published
        <FileCheck2 className='text-foreground size-3.5' aria-hidden />
      </span>
      <span className='mt-2 flex items-baseline gap-1.5'>
        <span className='text-foreground font-mono text-2xl font-bold tracking-tight tabular-nums sm:text-3xl'>
          {publishedCount.toString().padStart(2, '0')}
        </span>
        <span className='text-muted-foreground font-mono text-[10px] uppercase'>live</span>
      </span>
    </button>

    {/* Drafts Tile */}
    <button
      type='button'
      onClick={() => onTabChange('drafts')}
      className={cn(
        'group border-border flex cursor-pointer flex-col justify-between p-3.5 text-left transition-colors duration-150 sm:border-r',
        activeTab === 'drafts' ? 'bg-muted/50' : 'hover:bg-muted/20'
      )}
    >
      <span className='text-muted-foreground flex items-center justify-between font-mono text-[10px] tracking-widest uppercase'>
        Drafts
        <FileEdit className='text-foreground size-3.5' aria-hidden />
      </span>
      <span className='mt-2 flex items-baseline gap-1.5'>
        <span className='text-foreground font-mono text-2xl font-bold tracking-tight tabular-nums sm:text-3xl'>
          {draftCount.toString().padStart(2, '0')}
        </span>
        <span className='text-muted-foreground font-mono text-[10px] uppercase'>wip</span>
      </span>
    </button>

    {/* Total Views Tile */}
    <div className='border-border flex flex-col justify-between border-t p-3.5 sm:border-t-0 sm:border-r'>
      <span className='text-muted-foreground flex items-center justify-between font-mono text-[10px] tracking-widest uppercase'>
        Total reads
        <Eye className='text-foreground size-3.5' aria-hidden />
      </span>
      <span className='mt-2 flex items-baseline gap-1.5'>
        <span className='text-foreground font-mono text-2xl font-bold tracking-tight tabular-nums sm:text-3xl'>
          {totalViews.toLocaleString()}
        </span>
        <span className='text-muted-foreground font-mono text-[10px] uppercase'>views</span>
      </span>
    </div>

    {/* Total Likes Tile */}
    <div className='border-border flex flex-col justify-between border-t p-3.5 sm:border-t-0'>
      <span className='text-muted-foreground flex items-center justify-between font-mono text-[10px] tracking-widest uppercase'>
        Reactions
        <Heart className='size-3.5 text-rose-500' aria-hidden />
      </span>
      <span className='mt-2 flex items-baseline gap-1.5'>
        <span className='text-foreground font-mono text-2xl font-bold tracking-tight tabular-nums sm:text-3xl'>
          {totalLikes.toLocaleString()}
        </span>
        <span className='text-muted-foreground font-mono text-[10px] uppercase'>likes</span>
      </span>
    </div>
  </div>
)

type TabSelectorProps = {
  activeTab: TabOption
  onTabChange: (tab: TabOption) => void
  publishedCount: number
  draftCount: number
  totalCount: number
}

const TAB_BUTTON_CLASS =
  'inline-flex cursor-pointer items-center gap-2 border px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-all duration-150'

const TabSelector = ({
  activeTab,
  onTabChange,
  publishedCount,
  draftCount,
  totalCount
}: TabSelectorProps) => (
  <div className='flex flex-wrap items-center gap-1.5' role='tablist'>
    <button
      type='button'
      onClick={() => onTabChange('published')}
      className={cn(
        TAB_BUTTON_CLASS,
        activeTab === 'published'
          ? 'border-foreground bg-foreground text-background font-semibold shadow-xs'
          : 'border-border bg-background text-muted-foreground hover:border-foreground/70 hover:text-foreground'
      )}
      role='tab'
      aria-selected={activeTab === 'published'}
    >
      <FileCheck2 className='size-3.5' />
      <span>Published</span>
      <span className='text-[10px] opacity-75'>[{publishedCount.toString().padStart(2, '0')}]</span>
    </button>

    <button
      type='button'
      onClick={() => onTabChange('drafts')}
      className={cn(
        TAB_BUTTON_CLASS,
        activeTab === 'drafts'
          ? 'border-foreground bg-foreground text-background font-semibold shadow-xs'
          : 'border-border bg-background text-muted-foreground hover:border-foreground/70 hover:text-foreground'
      )}
      role='tab'
      aria-selected={activeTab === 'drafts'}
    >
      <FileEdit className='size-3.5' />
      <span>Drafts</span>
      <span className='text-[10px] opacity-75'>[{draftCount.toString().padStart(2, '0')}]</span>
    </button>

    <button
      type='button'
      onClick={() => onTabChange('all')}
      className={cn(
        TAB_BUTTON_CLASS,
        activeTab === 'all'
          ? 'border-foreground bg-foreground text-background font-semibold shadow-xs'
          : 'border-border bg-background text-muted-foreground hover:border-foreground/70 hover:text-foreground'
      )}
      role='tab'
      aria-selected={activeTab === 'all'}
    >
      <FolderOpen className='size-3.5' />
      <span>All Posts</span>
      <span className='text-[10px] opacity-75'>[{totalCount.toString().padStart(2, '0')}]</span>
    </button>
  </div>
)

const SortChips = ({
  sortBy,
  onSortChange
}: {
  sortBy: SortOption
  onSortChange: (option: SortOption) => void
}) => (
  <div className='border-border mt-3 flex flex-wrap items-center gap-1.5 border-t pt-3'>
    <span className='text-muted-foreground mr-1 font-mono text-[10px] tracking-widest uppercase'>
      Sort
    </span>
    {(['newest', 'views', 'popular', 'title'] as SortOption[]).map((option) => (
      <button
        key={option}
        type='button'
        onClick={() => onSortChange(option)}
        aria-pressed={sortBy === option}
        className={cn(
          'inline-flex cursor-pointer items-center gap-1.5 border px-2 py-1 font-mono text-[10px] tracking-wider uppercase transition-colors',
          sortBy === option
            ? 'border-foreground bg-foreground text-background font-semibold'
            : 'border-border/70 bg-background text-muted-foreground hover:border-foreground hover:text-foreground'
        )}
      >
        {sortLabels[option].icon}
        {sortLabels[option].label}
      </button>
    ))}
  </div>
)

export const PostsClient = ({ posts, user }: ContentProps) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tabParam = (searchParams.get('tab') ?? 'published') as TabOption

  const [activeTab, setActiveTab] = useState<TabOption>(tabParam)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false)

  const isAdmin = user.role === 'admin'

  const deleteDraftsAction = useAction(deleteDraftPostsAction, {
    onSuccess: () => {
      setIsDeleteAllOpen(false)
      toast.success('All drafts deleted successfully')
      router.refresh()
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? 'Failed to delete drafts')
    }
  })

  const handleDeleteAllDrafts = async () => {
    await deleteDraftsAction.executeAsync()
  }

  // Calculate Metrics
  const publishedPosts = useMemo(() => posts.filter((post) => post.published), [posts])
  const draftPosts = useMemo(() => posts.filter((post) => !post.published), [posts])
  const totalViews = useMemo(() => posts.reduce((acc, p) => acc + p.views, 0), [posts])
  const totalLikes = useMemo(() => posts.reduce((acc, p) => acc + (p.likeCount || 0), 0), [posts])

  // Regular user: liked posts
  const likedPosts = useMemo(
    () => posts.filter((p) => p.likes.some((like) => like.id === user.id) || p.likeCount > 0),
    [posts, user.id]
  )

  // Filter posts based on active tab
  const tabPosts = useMemo(() => {
    if (!isAdmin) return likedPosts

    if (activeTab === 'published') return publishedPosts
    if (activeTab === 'drafts') return draftPosts
    return posts
  }, [isAdmin, activeTab, publishedPosts, draftPosts, posts, likedPosts])

  // Apply search query
  const searchFilteredPosts = useMemo(() => {
    if (!search.trim()) return tabPosts
    const q = search.toLowerCase().trim()
    return tabPosts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.description ?? '').toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q))
    )
  }, [tabPosts, search])

  // Apply sorting
  const sortedPosts = useMemo(() => {
    const list = [...searchFilteredPosts]
    switch (sortBy) {
      case 'newest': {
        return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      }
      case 'views': {
        return list.sort((a, b) => b.views - a.views)
      }
      case 'popular': {
        return list.sort((a, b) => b.likeCount - a.likeCount)
      }
      case 'title': {
        return list.sort((a, b) => a.title.localeCompare(b.title))
      }
      default: {
        return list
      }
    }
  }, [searchFilteredPosts, sortBy])

  const handleTabChange = (nextTab: TabOption) => {
    setActiveTab(nextTab)
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', nextTab)
    router.push(`/me/posts?${params.toString()}`, { scroll: false })
  }

  let emptyAction: React.ReactNode = null
  if (search) {
    emptyAction = (
      <Button
        variant='outline'
        size='sm'
        onClick={() => setSearch('')}
        className='cursor-pointer font-mono text-xs uppercase'
      >
        Clear search
      </Button>
    )
  } else if (isAdmin) {
    emptyAction = (
      <NewPostButton className='border-foreground bg-foreground text-background hover:bg-foreground/90 border font-mono text-xs uppercase' />
    )
  }

  return (
    <div className='w-full space-y-6 sm:space-y-8'>
      {/* 1. Blueprint Studio Header Frame */}
      <Frame as='header'>
        <StripHeader
          left={
            isAdmin ? (
              <span className='text-foreground font-semibold'>
                Author studio // Content library
              </span>
            ) : (
              <span className='text-foreground font-semibold'>
                Your library // Saved &amp; liked
              </span>
            )
          }
          right={
            isAdmin ? (
              <NewPostButton className='border-border bg-background text-foreground hover:border-foreground hover:bg-foreground hover:text-background inline-flex cursor-pointer items-center gap-1.5 border px-2 py-px text-[9px] font-semibold tracking-widest uppercase transition-colors' />
            ) : (
              <span>ID: {user.name || user.email}</span>
            )
          }
        />
        <FrameBody className='space-y-5'>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between'>
            <div>
              <h1 className='font-heading text-foreground text-3xl font-semibold tracking-tight sm:text-4xl'>
                {isAdmin ? 'Content Library' : 'Saved & Liked Articles'}
              </h1>
              <p className='text-muted-foreground mt-1 text-sm leading-relaxed sm:text-base'>
                {isAdmin
                  ? 'Monitor article metrics, continue editing ongoing drafts, and publish technical write-ups.'
                  : 'Articles and engineering guides you have liked or bookmarked across the space.'}
              </p>
            </div>
            {isAdmin && (
              <span className='text-muted-foreground font-mono text-[10px] tracking-widest uppercase'>
                ID: {user.name || user.email}
              </span>
            )}
          </div>

          {isAdmin && (
            <MetricsRow
              activeTab={activeTab}
              onTabChange={handleTabChange}
              publishedCount={publishedPosts.length}
              draftCount={draftPosts.length}
              totalViews={totalViews}
              totalLikes={totalLikes}
            />
          )}
        </FrameBody>
      </Frame>

      {/* 2. Unified Filter & Tab Navigation Frame */}
      <Frame className='relative overflow-visible'>
        <StripHeader
          left={<span className='text-foreground font-semibold'>View &amp; filter console</span>}
          right={
            <>
              <span>
                {sortedPosts.length} {sortedPosts.length === 1 ? 'article' : 'articles'} showing
              </span>
              {search && (
                <button
                  type='button'
                  onClick={() => setSearch('')}
                  className='border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground inline-flex cursor-pointer items-center gap-1 border px-2 py-px text-[9px] font-semibold transition-colors'
                >
                  <X className='size-2.5' aria-hidden />
                  Reset
                </button>
              )}
            </>
          }
        />

        {/* Tab Selector & Controls Bar */}
        <div className='border-border bg-muted/20 border-b p-3 sm:p-4'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            {/* Blueprint Segmented Tabs */}
            {isAdmin ? (
              <TabSelector
                activeTab={activeTab}
                onTabChange={handleTabChange}
                publishedCount={publishedPosts.length}
                draftCount={draftPosts.length}
                totalCount={posts.length}
              />
            ) : (
              <div className='flex items-center gap-2'>
                <span className='border-foreground bg-foreground text-background inline-flex items-center gap-1.5 border px-3 py-1 font-mono text-xs font-semibold uppercase'>
                  <Heart className='size-3.5 fill-current' />
                  Liked Articles [{likedPosts.length}]
                </span>
              </div>
            )}

            {/* Search Input */}
            <div className='flex items-center gap-2'>
              <div className='relative w-full sm:w-60'>
                <Search className='text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2' />
                <input
                  type='text'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder='Filter by title or tag...'
                  className='border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:border-foreground h-8 w-full border pr-7 pl-8 font-mono text-xs transition-colors outline-none'
                />
                {search && (
                  <button
                    type='button'
                    onClick={() => setSearch('')}
                    className='text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer'
                    aria-label='Clear search'
                  >
                    <X className='size-3' />
                  </button>
                )}
              </div>
            </div>
          </div>

          <SortChips sortBy={sortBy} onSortChange={setSortBy} />
        </div>

        {/* 3. Drafts Bulk Management Banner (When in drafts tab) */}
        {isAdmin && activeTab === 'drafts' && draftPosts.length > 0 && (
          <div className='border-border bg-muted/30 text-muted-foreground flex flex-wrap items-center justify-between gap-3 border-b px-4 py-2.5 text-xs sm:px-5'>
            <div className='flex items-center gap-2'>
              <span className='bg-foreground flex size-2 rounded-full' aria-hidden />
              <span>
                You have <strong className='text-foreground'>{draftPosts.length}</strong> draft{' '}
                {draftPosts.length === 1 ? 'article' : 'articles'} in progress
              </span>
            </div>
            <Button
              variant='destructive'
              size='sm'
              onClick={() => setIsDeleteAllOpen(true)}
              disabled={deleteDraftsAction.isExecuting}
              className='cursor-pointer gap-1.5 font-mono text-[11px] uppercase'
            >
              <Trash2Icon className='size-3.5' />
              Delete all drafts
            </Button>
          </div>
        )}

        {/* 4. Article List / Feed */}
        {sortedPosts.length === 0 ? (
          <div className='flex flex-col items-center justify-center p-10 text-center sm:p-16'>
            <span className='border-border bg-muted/30 mb-4 flex size-12 items-center justify-center border'>
              <Inbox className='text-muted-foreground size-6' />
            </span>
            <p className='text-foreground font-semibold'>{getEmptyStateTitle(search, activeTab)}</p>
            <p className='text-muted-foreground mt-1 max-w-sm text-xs leading-relaxed'>
              {getEmptyStateDescription(search, activeTab)}
            </p>
            <div className='mt-5 flex flex-wrap gap-2'>{emptyAction}</div>
          </div>
        ) : (
          <div className='divide-border divide-y'>
            {sortedPosts.map((post) => (
              <PostCard key={post.id} post={post} user={user} showAuthor={!isAdmin} />
            ))}
          </div>
        )}
      </Frame>

      {/* Delete All Drafts Confirmation Modal */}
      <AlertDialog open={isDeleteAllOpen} onOpenChange={setIsDeleteAllOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='font-mono tracking-tight uppercase'>
              Delete all drafts?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all {draftPosts.length} drafts. Published posts will
              remain untouched. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleteDraftsAction.isExecuting}
              className='font-mono text-xs uppercase'
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAllDrafts}
              disabled={deleteDraftsAction.isExecuting}
              className={buttonVariants({
                variant: 'destructive',
                className: 'gap-1.5 font-mono text-xs uppercase'
              })}
            >
              {deleteDraftsAction.isExecuting ? (
                <Loader2Icon className='size-3.5 animate-spin' />
              ) : (
                <Trash2Icon className='size-3.5' />
              )}
              Delete all {draftPosts.length} drafts
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default PostsClient
