'use client'

import type { User } from '@/db/schema'

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
import { CornerBrackets, Frame, FrameBody, FrameHeader } from '@/components/frame'
import NewPostButton from '@/components/new-post-button'
import PostCard, { type PostCardProps } from '@/components/post-card'
import { cn } from '@/utils'

type SortOption = 'newest' | 'views' | 'popular' | 'title'
type TabOption = 'published' | 'drafts' | 'all'

type ContentProps = {
  posts: Array<PostCardProps['post']>
  user: User
}

export const PostsClient = ({ posts, user }: ContentProps) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tabParam = (searchParams.get('tab') as TabOption) || 'published'

  const [activeTab, setActiveTab] = useState<TabOption>(tabParam)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [showSortMenu, setShowSortMenu] = useState(false)
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
  const publishedPosts = useMemo(
    () => posts.filter((post) => post.published),
    [posts]
  )
  const draftPosts = useMemo(
    () => posts.filter((post) => !post.published),
    [posts]
  )
  const totalViews = useMemo(
    () => posts.reduce((acc, p) => acc + (p.views || 0), 0),
    [posts]
  )
  const totalLikes = useMemo(
    () => posts.reduce((acc, p) => acc + (p.likeCount || 0), 0),
    [posts]
  )

  // Regular user: liked posts
  const likedPosts = useMemo(
    () =>
      posts.filter(
        (p) =>
          p.likes?.some((like) => like.id === user.id) ||
          p.likeCount > 0
      ),
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
      case 'newest':
        return list.sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        )
      case 'views':
        return list.sort((a, b) => b.views - a.views)
      case 'popular':
        return list.sort((a, b) => b.likeCount - a.likeCount)
      case 'title':
        return list.sort((a, b) => a.title.localeCompare(b.title))
      default:
        return list
    }
  }, [searchFilteredPosts, sortBy])

  const handleTabChange = (nextTab: TabOption) => {
    setActiveTab(nextTab)
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', nextTab)
    router.push(`/me/posts?${params.toString()}`, { scroll: false })
  }

  const sortLabels: Record<SortOption, { label: string; icon: React.ReactNode }> = {
    newest: { label: 'Newest First', icon: <Clock className="size-3" /> },
    views: { label: 'Most Views', icon: <Eye className="size-3" /> },
    popular: { label: 'Most Liked', icon: <Heart className="size-3" /> },
    title: { label: 'Alphabetical', icon: <ArrowUpDown className="size-3" /> }
  }

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {/* 1. Blueprint Studio Header Frame */}
      <Frame as="header">
        <FrameHeader label={isAdmin ? 'Author Studio' : 'Your Library'}>
          {isAdmin && (
            <div className="flex items-center gap-2">
              <NewPostButton className="inline-flex items-center gap-1.5 border border-border bg-background px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background cursor-pointer" />
            </div>
          )}
        </FrameHeader>
        <FrameBody className="space-y-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {isAdmin ? 'Content Library' : 'Saved & Liked Articles'}
              </h1>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {isAdmin
                  ? 'Monitor article metrics, continue editing ongoing drafts, and publish technical write-ups.'
                  : 'Articles and engineering guides you have liked or bookmarked across the space.'}
              </p>
            </div>
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              ID: {user.name || user.email}
            </span>
          </div>

          {/* 4-Card Blueprint Metrics Grid (Admin) */}
          {isAdmin && (
            <div className="grid grid-cols-2 gap-2.5 pt-2 sm:grid-cols-4 sm:gap-3">
              {/* Published Tile */}
              <button
                type="button"
                onClick={() => handleTabChange('published')}
                className={cn(
                  'group flex flex-col justify-between border p-3 sm:p-4 text-left transition-all duration-150 cursor-pointer',
                  activeTab === 'published'
                    ? 'border-foreground bg-muted/40 shadow-xs'
                    : 'border-border bg-card/60 hover:border-foreground/60 hover:bg-muted/20'
                )}
              >
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="font-mono text-[10px] uppercase tracking-widest">
                    Published
                  </span>
                  <FileCheck2 className="size-3.5 text-foreground" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-mono text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {publishedPosts.length.toString().padStart(2, '0')}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground uppercase">
                    Live
                  </span>
                </div>
              </button>

              {/* Drafts Tile */}
              <button
                type="button"
                onClick={() => handleTabChange('drafts')}
                className={cn(
                  'group flex flex-col justify-between border p-3 sm:p-4 text-left transition-all duration-150 cursor-pointer',
                  activeTab === 'drafts'
                    ? 'border-foreground bg-muted/40 shadow-xs'
                    : 'border-border bg-card/60 hover:border-foreground/60 hover:bg-muted/20'
                )}
              >
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="font-mono text-[10px] uppercase tracking-widest">
                    Drafts
                  </span>
                  <FileEdit className="size-3.5 text-foreground" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-mono text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {draftPosts.length.toString().padStart(2, '0')}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground uppercase">
                    WIP
                  </span>
                </div>
              </button>

              {/* Total Views Tile */}
              <div className="flex flex-col justify-between border border-border bg-card/60 p-3 sm:p-4">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="font-mono text-[10px] uppercase tracking-widest">
                    Total Reads
                  </span>
                  <Eye className="size-3.5 text-foreground" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-mono text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {totalViews.toLocaleString()}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground uppercase">
                    Views
                  </span>
                </div>
              </div>

              {/* Total Likes Tile */}
              <div className="flex flex-col justify-between border border-border bg-card/60 p-3 sm:p-4">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="font-mono text-[10px] uppercase tracking-widest">
                    Reactions
                  </span>
                  <Heart className="size-3.5 text-rose-500" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-mono text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {totalLikes.toLocaleString()}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground uppercase">
                    Likes
                  </span>
                </div>
              </div>
            </div>
          )}
        </FrameBody>
      </Frame>

      {/* 2. Unified Filter & Tab Navigation Frame */}
      <Frame className="relative overflow-visible">
        <CornerBrackets />
        <FrameHeader label="View & Filter Console">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-muted-foreground uppercase">
              {sortedPosts.length}{' '}
              {sortedPosts.length === 1 ? 'article' : 'articles'} showing
            </span>
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="inline-flex items-center gap-1 border border-border bg-background px-2 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-3" />
                Reset search
              </button>
            )}
          </div>
        </FrameHeader>

        {/* Tab Selector & Controls Bar */}
        <div className="border-b border-border bg-muted/20 p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Blueprint Segmented Tabs */}
            {isAdmin ? (
              <div className="flex flex-wrap items-center gap-1.5" role="tablist">
                <button
                  type="button"
                  onClick={() => handleTabChange('published')}
                  className={cn(
                    'inline-flex items-center gap-2 border px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer',
                    activeTab === 'published'
                      ? 'border-foreground bg-foreground text-background font-semibold shadow-xs'
                      : 'border-border bg-background text-muted-foreground hover:border-foreground/70 hover:text-foreground'
                  )}
                  role="tab"
                  aria-selected={activeTab === 'published'}
                >
                  <FileCheck2 className="size-3.5" />
                  <span>Published</span>
                  <span className="text-[10px] opacity-75">
                    [{publishedPosts.length.toString().padStart(2, '0')}]
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange('drafts')}
                  className={cn(
                    'inline-flex items-center gap-2 border px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer',
                    activeTab === 'drafts'
                      ? 'border-foreground bg-foreground text-background font-semibold shadow-xs'
                      : 'border-border bg-background text-muted-foreground hover:border-foreground/70 hover:text-foreground'
                  )}
                  role="tab"
                  aria-selected={activeTab === 'drafts'}
                >
                  <FileEdit className="size-3.5" />
                  <span>Drafts</span>
                  <span className="text-[10px] opacity-75">
                    [{draftPosts.length.toString().padStart(2, '0')}]
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange('all')}
                  className={cn(
                    'inline-flex items-center gap-2 border px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer',
                    activeTab === 'all'
                      ? 'border-foreground bg-foreground text-background font-semibold shadow-xs'
                      : 'border-border bg-background text-muted-foreground hover:border-foreground/70 hover:text-foreground'
                  )}
                  role="tab"
                  aria-selected={activeTab === 'all'}
                >
                  <FolderOpen className="size-3.5" />
                  <span>All Posts</span>
                  <span className="text-[10px] opacity-75">
                    [{posts.length.toString().padStart(2, '0')}]
                  </span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 border border-foreground bg-foreground text-background px-3 py-1 font-mono text-xs uppercase font-semibold">
                  <Heart className="size-3.5 fill-current" />
                  Liked Articles [{likedPosts.length}]
                </span>
              </div>
            )}

            {/* Search Input & Sort Action */}
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter by title or tag..."
                  className="h-8 w-full border border-border bg-background pl-8 pr-7 font-mono text-xs text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-foreground"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>

              {/* Sort Toggle Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="gap-1.5 font-mono text-xs uppercase cursor-pointer"
                title="Change sort order"
              >
                <ArrowUpDown className="size-3" />
                <span className="hidden sm:inline">Sort:</span>
                <span>{sortBy}</span>
              </Button>
            </div>
          </div>

          {/* Quick Sort Options Dropdown Bar */}
          {showSortMenu && (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
              <span className="font-mono text-[10px] uppercase text-muted-foreground">
                Sort by:
              </span>
              {(['newest', 'views', 'popular', 'title'] as SortOption[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setSortBy(option)
                    setShowSortMenu(false)
                  }}
                  className={cn(
                    'inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[11px] uppercase transition-colors cursor-pointer',
                    sortBy === option
                      ? 'border-foreground bg-foreground text-background font-semibold'
                      : 'border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground'
                  )}
                >
                  {sortLabels[option].icon}
                  {sortLabels[option].label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. Drafts Bulk Management Banner (When in drafts tab) */}
        {isAdmin && activeTab === 'drafts' && draftPosts.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/30 px-4 py-2.5 text-xs text-muted-foreground sm:px-5">
            <div className="flex items-center gap-2">
              <span className="flex size-2 rounded-full bg-foreground" aria-hidden />
              <span>
                You have <strong className="text-foreground">{draftPosts.length}</strong>{' '}
                draft {draftPosts.length === 1 ? 'article' : 'articles'} in progress
              </span>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDeleteAllOpen(true)}
              disabled={deleteDraftsAction.isExecuting}
              className="gap-1.5 font-mono text-[11px] uppercase cursor-pointer"
            >
              <Trash2Icon className="size-3.5" />
              Delete all drafts
            </Button>
          </div>
        )}

        {/* 4. Article List / Feed */}
        {sortedPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 text-center sm:p-16">
            <span className="mb-4 flex size-12 items-center justify-center border border-border bg-muted/30">
              <Inbox className="size-6 text-muted-foreground" />
            </span>
            <p className="font-semibold text-foreground">
              {search
                ? `No articles match "${search}"`
                : activeTab === 'drafts'
                  ? 'No drafts in progress'
                  : activeTab === 'published'
                    ? 'No published articles yet'
                    : 'No articles found in this view'}
            </p>
            <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
              {search
                ? 'Try searching with a different term or reset your search filter.'
                : activeTab === 'drafts'
                  ? 'Start a new draft to draft out thoughts, technical tutorials, and architecture notes.'
                  : 'Create and publish your first technical article for the community!'}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {search ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearch('')}
                  className="font-mono text-xs uppercase cursor-pointer"
                >
                  Clear search
                </Button>
              ) : isAdmin ? (
                <NewPostButton className="border border-foreground bg-foreground text-background hover:bg-foreground/90 font-mono text-xs uppercase" />
              ) : null}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {sortedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                user={user}
                showAuthor={!isAdmin}
              />
            ))}
          </div>
        )}
      </Frame>

      {/* Delete All Drafts Confirmation Modal */}
      <AlertDialog open={isDeleteAllOpen} onOpenChange={setIsDeleteAllOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-mono uppercase tracking-tight">
              Delete all drafts?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all {draftPosts.length} drafts. Published
              posts will remain untouched. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleteDraftsAction.isExecuting}
              className="font-mono text-xs uppercase"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAllDrafts}
              disabled={deleteDraftsAction.isExecuting}
              className={buttonVariants({ variant: 'destructive', className: 'font-mono text-xs uppercase gap-1.5' })}
            >
              {deleteDraftsAction.isExecuting ? (
                <Loader2Icon className="size-3.5 animate-spin" />
              ) : (
                <Trash2Icon className="size-3.5" />
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
