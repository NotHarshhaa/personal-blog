'use client'

import type { User } from '@/db/schema'

import { Tabs, TabsContent, TabsList, TabsTrigger, Input } from '@/components/ui'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useMemo, useRef } from 'react'
import { FileText, FileCheck2, Heart, Search, Inbox } from 'lucide-react'

import PostCard, { type PostCardProps } from '@/components/post-card'

// Lazy-load NewPostButton for client-side hydration
import dynamic from 'next/dynamic'
const NewPostButton = dynamic(() => import('@/components/new-post-button'), { ssr: false })

// Illustration for empty state
const EmptyIllustration = ({ isAdmin }: { isAdmin: boolean }) => (
  <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
    <div className="rounded-full bg-muted/50 p-4 mb-4">
      <Inbox className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground" />
    </div>
    <div className="text-lg sm:text-xl font-bold mb-2">{isAdmin ? 'No posts found' : 'No liked posts found'}</div>
    <div className="text-muted-foreground text-sm sm:text-base mb-6 max-w-md">{isAdmin ? 'Start writing your first post or check your filters.' : 'Start liking posts to see them here.'}</div>
    {isAdmin && <NewPostButton />}
  </div>
)

type ContentProps = {
  posts: Array<PostCardProps['post']>
  user: User
}

const PostsClient = (props: ContentProps) => {
  const { posts, user } = props
  const searchParams = useSearchParams()
  const router = useRouter()
  const tab = searchParams.get('tab') ?? 'drafts'
  const [activeTab, setActiveTab] = useState(tab)
  const [search, setSearch] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  const isAdmin = user.role === 'admin'

  // Hydrate Write New Post button in header (admin only)
  useEffect(() => {
    if (!isAdmin) return;
    const mountBtn = document.getElementById('new-post-btn-placeholder')
    if (mountBtn && mountBtn.childElementCount === 0) {
      const btn = document.createElement('div')
      btn.id = 'new-post-btn-hydrated'
      mountBtn.appendChild(btn)
      import('react-dom/client').then(({ createRoot }) => {
        createRoot(btn).render(<NewPostButton />)
      })
    }
  }, [isAdmin])

  // Stats (admin only)
  const drafts = useMemo(() => posts.filter((post) => !post.published), [posts])
  const published = useMemo(() => posts.filter((post) => post.published), [posts])
  const totalLikes = useMemo(() => posts.reduce((acc, p) => acc + (p.likes?.length || 0), 0), [posts])

  // Filtered posts
  const filteredDrafts = useMemo(
    () => drafts.filter((p) => p.title?.toLowerCase().includes(search.toLowerCase()) || (p.description ?? '').toLowerCase().includes(search.toLowerCase())),
    [drafts, search]
  )
  const filteredPublished = useMemo(
    () => published.filter((p) => p.title?.toLowerCase().includes(search.toLowerCase()) || (p.description ?? '').toLowerCase().includes(search.toLowerCase())),
    [published, search]
  )

  // For users: liked posts only
  const likedPosts = useMemo(
    () => posts.filter((p) => p.likes?.some((like) => like.id === user.id) && (p.title?.toLowerCase().includes(search.toLowerCase()) || (p.description ?? '').toLowerCase().includes(search.toLowerCase()))),
    [posts, user.id, search]
  )

  // Hydrate summary bar (admin only)
  useEffect(() => {
    const bar = document.getElementById('posts-summary-bar')
    if (!isAdmin) {
      if (bar) bar.innerHTML = ''
      return
    }
    if (bar) {
      bar.innerHTML = ''
      import('react-dom/client').then(({ createRoot }) => {
        createRoot(bar).render(
          <div className="flex flex-wrap gap-3 sm:gap-4 items-center justify-between rounded-xl border border-border/40 bg-gradient-to-br from-primary/5 via-background to-background px-4 py-3 text-sm shadow-sm">
            <div className="flex flex-wrap gap-3 sm:gap-4 items-center">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <div className="flex items-center justify-center size-7 rounded-lg bg-primary/10 dark:bg-primary/20">
                  <FileText className="w-3.5 h-3.5 text-primary" />
                </div>
                <span>{drafts.length} Drafts</span>
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <div className="flex items-center justify-center size-7 rounded-lg bg-primary/10 dark:bg-primary/20">
                  <FileCheck2 className="w-3.5 h-3.5 text-primary" />
                </div>
                <span>{published.length} Published</span>
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <div className="flex items-center justify-center size-7 rounded-lg bg-pink-100 dark:bg-pink-900/30">
                  <Heart className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
                </div>
                <span>{totalLikes} Likes</span>
              </span>
            </div>
            <span className="text-muted-foreground text-xs sm:text-sm font-medium">Total: {posts.length}</span>
          </div>
        )
      })
    }
  }, [isAdmin, drafts.length, published.length, totalLikes, posts.length])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    router.push(`/me/posts?tab=${value}`)
  }

  if (!isAdmin) {
    // User: only liked posts
    return (
      <div>
        <div className="flex items-center gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search liked posts..."
              className="pl-9 pr-3 py-2.5 rounded-xl border-border/40 bg-white/80 dark:bg-zinc-800/80"
              aria-label="Search liked posts"
            />
          </div>
        </div>
        {likedPosts.length === 0 ? (
          <EmptyIllustration isAdmin={false} />
        ) : (
          <div className="space-y-4 sm:space-y-5">
            {likedPosts.map((post) => (
              <PostCard key={post.id} post={post} user={user} showAuthor={true} />
            ))}
          </div>
        )}
      </div>
    )
  }

  // Admin: full UI
  return (
    <div>
      {/* Search bar */}
      <div className="flex items-center gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            ref={searchRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your posts..."
            className="pl-9 pr-3 py-2.5 rounded-xl border-border/40 bg-white/80 dark:bg-zinc-800/80"
            aria-label="Search posts"
          />
        </div>
      </div>
      {/* Tabs */}
      <Tabs defaultValue="drafts" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6 rounded-xl bg-muted/30 p-1">
          <TabsTrigger value="drafts" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <FileText className="w-4 h-4 mr-2" /> 
            <span>Drafts</span>
            {drafts.length > 0 && <span className="ml-1.5 rounded-full bg-primary/10 dark:bg-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">{drafts.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="published" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <FileCheck2 className="w-4 h-4 mr-2" /> 
            <span>Published</span>
            {published.length > 0 && <span className="ml-1.5 rounded-full bg-primary/10 dark:bg-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">{published.length}</span>}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="drafts" className="mt-0">
          {filteredDrafts.length === 0 ? (
            <EmptyIllustration isAdmin={true} />
          ) : (
            <div className="space-y-4 sm:space-y-5">
              {filteredDrafts.map((post) => (
                <PostCard key={post.id} post={post} user={user} showAuthor={false} />
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="published" className="mt-0">
          {filteredPublished.length === 0 ? (
            <EmptyIllustration isAdmin={true} />
          ) : (
            <div className="space-y-4 sm:space-y-5">
              {filteredPublished.map((post) => (
                <PostCard key={post.id} post={post} user={user} showAuthor={false} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default PostsClient
