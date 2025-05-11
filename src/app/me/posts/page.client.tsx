'use client'

import type { User } from '@/db/schema'

import { Tabs, TabsContent, TabsList, TabsTrigger, Input } from '@tszhong0411/ui'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useMemo, useRef } from 'react'
import { FileText, FileCheck2, Heart, Search, Inbox } from 'lucide-react'

import PostCard, { type PostCardProps } from '@/components/post-card'

// Lazy-load NewPostButton for client-side hydration
import dynamic from 'next/dynamic'
const NewPostButton = dynamic(() => import('@/components/new-post-button'), { ssr: false })

// Illustration for empty state
const EmptyIllustration = () => (
  <div className="flex flex-col items-center justify-center py-8 text-center">
    <Inbox className="w-16 h-16 text-muted-foreground mb-4" />
    <div className="text-lg font-semibold mb-2">No posts found</div>
    <div className="text-muted-foreground mb-4">Start writing your first post or check your filters.</div>
    <NewPostButton />
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

  // Hydrate Write New Post button in header
  useEffect(() => {
    const mountBtn = document.getElementById('new-post-btn-placeholder')
    if (mountBtn && mountBtn.childElementCount === 0) {
      const btn = document.createElement('div')
      btn.id = 'new-post-btn-hydrated'
      mountBtn.appendChild(btn)
      import('react-dom/client').then(({ createRoot }) => {
        createRoot(btn).render(<NewPostButton />)
      })
    }
  }, [])

  // Stats
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

  // Hydrate summary bar
  useEffect(() => {
    const bar = document.getElementById('posts-summary-bar')
    if (bar) {
      bar.innerHTML = ''
      import('react-dom/client').then(({ createRoot }) => {
        createRoot(bar).render(
          <div className="flex flex-wrap gap-4 items-center justify-between rounded-xl bg-muted/40 px-4 py-3 mb-2 text-sm shadow-sm">
            <div className="flex gap-4 items-center">
              <span className="inline-flex items-center gap-1"><FileText className="w-4 h-4" /> {drafts.length} Drafts</span>
              <span className="inline-flex items-center gap-1"><FileCheck2 className="w-4 h-4" /> {published.length} Published</span>
              <span className="inline-flex items-center gap-1"><Heart className="w-4 h-4 text-pink-500" /> {totalLikes} Likes</span>
            </div>
            <span className="text-muted-foreground">Total: {posts.length}</span>
          </div>
        )
      })
    }
  }, [drafts.length, published.length, totalLikes, posts.length])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    router.push(`/me/posts?tab=${value}`)
  }

  return (
    <div>
      {/* Search bar */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            ref={searchRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your posts..."
            className="pl-9 pr-3 py-2 rounded-lg bg-muted/30 dark:bg-zinc-800/40"
            aria-label="Search posts"
          />
        </div>
      </div>
      {/* Tabs */}
      <Tabs defaultValue="drafts" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-2">
          <TabsTrigger value="drafts">
            <FileText className="w-4 h-4 mr-1" /> Drafts {drafts.length > 0 && <span>({drafts.length})</span>}
          </TabsTrigger>
          <TabsTrigger value="published">
            <FileCheck2 className="w-4 h-4 mr-1" /> Published {published.length > 0 && <span>({published.length})</span>}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="drafts">
          {filteredDrafts.length === 0 ? <EmptyIllustration /> : filteredDrafts.map((post) => (
            <PostCard key={post.id} post={post} user={user} showAuthor={false} />
          ))}
        </TabsContent>
        <TabsContent value="published">
          {filteredPublished.length === 0 ? <EmptyIllustration /> : filteredPublished.map((post) => (
            <PostCard key={post.id} post={post} user={user} showAuthor={false} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default PostsClient
