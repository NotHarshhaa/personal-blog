'use client'

import type { User } from '@/db/schema'

import {
  ArrowUpDown,
  Clock,
  Heart,
  Layers,
  Search,
  TagIcon,
  TrendingUp,
  X
} from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { type ReactNode, useEffect, useMemo, useState } from 'react'

import { CornerBrackets, Frame, FrameHeader } from '@/components/frame'
import PostCard, { type PostCardProps } from '@/components/post-card'
import { Button } from '@/components/ui'
import { SITE_TOPICS } from '@/lib/constants'
import { cn } from '@/utils'

type PostsFilterProps = {
  posts: Array<PostCardProps['post']>
  user: User | null
}

type SortOption = 'newest' | 'oldest' | 'popular' | 'trending'

type CategoryFilter = 'all' | 'devops' | 'ai' | 'tools'

const CATEGORY_TABS: Array<{ id: CategoryFilter; label: string }> = [
  { id: 'all', label: 'All Topics' },
  { id: 'devops', label: 'DevOps & Cloud' },
  { id: 'ai', label: 'AI & LLMOps' },
  { id: 'tools', label: 'Tools & Infra' }
]

const AI_TOPICS = new Set([
  'ai / ml',
  'ai infrastructure',
  'llmops',
  'mlops',
  'genai',
  'productivity'
])

const DEVOPS_TOPICS = new Set([
  'devops',
  'cloud',
  'platform engineering',
  'ci/cd',
  'automation'
])

const TOOL_TOPICS = new Set([
  'kubernetes',
  'aws',
  'azure',
  'docker',
  'terraform',
  'linux',
  'python',
  'bash',
  'github actions',
  'infrastructure',
  'learning'
])

export const PostsFilter = ({ posts, user }: PostsFilterProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tagParam = searchParams.get('tag')

  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTag, setSelectedTag] = useState<string | null>(tagParam)
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    setSelectedTag(tagParam)
  }, [tagParam])

  const handleSelectTag = (tag: string | null) => {
    setSelectedTag(tag)
    const params = new URLSearchParams(searchParams.toString())
    if (tag) {
      params.set('tag', tag)
    } else {
      params.delete('tag')
    }
    const query = params.toString() ? `?${params.toString()}` : ''
    router.push(`${pathname}${query}`, { scroll: false })
  }

  const handleClearAllFilters = () => {
    handleSelectTag(null)
    setSearchQuery('')
    setActiveCategory('all')
  }

  // Derive all active tags from posts, prioritizing SITE_TOPICS
  const allTags = useMemo(() => {
    const postTagSet = new Set<string>()
    for (const p of posts) {
      if (p.tags) {
        for (const t of p.tags) postTagSet.add(t)
      }
    }

    return Array.from(new Set([...SITE_TOPICS, ...Array.from(postTagSet)]))
  }, [posts])

  // Count posts per tag for visual tag counts
  const tagCounts = useMemo(() => {
    const map = new Map<string, number>()
    for (const p of posts) {
      if (p.tags) {
        for (const t of p.tags) {
          const lower = t.toLowerCase().trim()
          map.set(lower, (map.get(lower) ?? 0) + 1)
        }
      }
    }
    return map
  }, [posts])

  // Filter tags based on selected category tab
  const visibleTags = useMemo(() => {
    if (activeCategory === 'all') return allTags

    return allTags.filter((tag) => {
      const lower = tag.toLowerCase().trim()
      if (activeCategory === 'devops') return DEVOPS_TOPICS.has(lower)
      if (activeCategory === 'ai') return AI_TOPICS.has(lower)
      return TOOL_TOPICS.has(lower)
    })
  }, [allTags, activeCategory])

  // Filter posts by selected tag & search query
  const filteredPosts = useMemo(() => {
    let result = posts

    if (selectedTag) {
      const lowerTag = selectedTag.toLowerCase().trim()
      result = result.filter((post) => {
        const matchTag =
          post.tags?.some((t) => {
            const tl = t.toLowerCase().trim()
            return (
              tl === lowerTag ||
              tl.includes(lowerTag) ||
              lowerTag.includes(tl)
            )
          }) ?? false
        const matchTitle = post.title.toLowerCase().includes(lowerTag)
        const matchDesc =
          post.description?.toLowerCase().includes(lowerTag) ?? false
        return matchTag || matchTitle || matchDesc
      })
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter((post) => {
        const matchTitle = post.title.toLowerCase().includes(q)
        const matchDesc = post.description?.toLowerCase().includes(q) ?? false
        const matchTags =
          post.tags?.some((t) => t.toLowerCase().includes(q)) ?? false
        return matchTitle || matchDesc || matchTags
      })
    }

    return result
  }, [posts, selectedTag, searchQuery])

  // Sort filtered posts
  const sortedPosts = useMemo(() => {
    const sorted = [...filteredPosts]

    switch (sortBy) {
      case 'newest': {
        return sorted.sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        )
      }
      case 'oldest': {
        return sorted.sort(
          (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
        )
      }
      case 'popular': {
        return sorted.sort((a, b) => {
          const diff = b.likeCount - a.likeCount
          return diff === 0 ? b.views - a.views : diff
        })
      }
      case 'trending': {
        return sorted.sort((a, b) => {
          const aScore =
            a.likeCount * 10 +
            a.views +
            (Date.now() - a.createdAt.getTime()) / (1000 * 60 * 60 * 24)
          const bScore =
            b.likeCount * 10 +
            b.views +
            (Date.now() - b.createdAt.getTime()) / (1000 * 60 * 60 * 24)
          return bScore - aScore
        })
      }
      default: {
        return sorted
      }
    }
  }, [filteredPosts, sortBy])

  const sortOptions: Array<{
    value: SortOption
    label: string
    icon: ReactNode
  }> = [
    { value: 'newest', label: 'Newest', icon: <Clock className="size-3.5" /> },
    { value: 'oldest', label: 'Oldest', icon: <Clock className="size-3.5" /> },
    {
      value: 'popular',
      label: 'Most Liked',
      icon: <Heart className="size-3.5" />
    },
    {
      value: 'trending',
      label: 'Trending',
      icon: <TrendingUp className="size-3.5" />
    }
  ]

  const hasActiveFilter = Boolean(selectedTag ?? searchQuery)

  const getHeaderLabel = () => {
    if (selectedTag) {
      return `Articles in #${selectedTag}`
    }
    if (searchQuery) {
      return `Results for "${searchQuery}"`
    }
    return 'Latest technical write-ups'
  }

  const getEmptyMessage = () => {
    if (selectedTag) {
      const matchSuffix = searchQuery ? ' matching "' + searchQuery + '"' : ''
      return `No posts found for #${selectedTag}${matchSuffix}.`
    }
    return `No posts matched "${searchQuery}".`
  }

  return (
    <div className="w-full space-y-4">
      {/* Blueprint Topics & Tag Filtering Hub */}
      <Frame className="relative overflow-visible">
        <CornerBrackets />
        <FrameHeader label="Topic Navigator & Filter">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-muted-foreground uppercase">
              {allTags.length} Topics
            </span>
            {hasActiveFilter && (
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="inline-flex items-center gap-1 border border-border bg-background px-2 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground cursor-pointer"
                aria-label="Clear all filters"
              >
                <X className="size-3" />
                Reset
              </button>
            )}
          </div>
        </FrameHeader>

        {/* Category Tabs & Quick Search Input */}
        <div className="border-b border-border bg-muted/20 px-3 py-2.5 sm:px-4">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            {/* Category Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5" role="tablist">
              {CATEGORY_TABS.map((tab) => {
                const isTabActive = activeCategory === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveCategory(tab.id)}
                    className={cn(
                      'border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider transition-all duration-150 cursor-pointer',
                      isTabActive
                        ? 'border-foreground bg-foreground text-background font-semibold shadow-xs'
                        : 'border-border/80 bg-background text-muted-foreground hover:border-foreground/60 hover:text-foreground'
                    )}
                    role="tab"
                    aria-selected={isTabActive}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Quick Keyword Filter Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter articles..."
                className="h-7.5 w-full border border-border bg-background pl-8 pr-7 font-mono text-xs text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-foreground"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  aria-label="Clear search filter"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tag Pills Cloud */}
        <div className="flex flex-wrap items-center gap-2 p-3 sm:p-4">
          {/* All Posts Reset Pill */}
          <button
            type="button"
            onClick={() => handleSelectTag(null)}
            className={cn(
              'group inline-flex items-center gap-1.5 border px-3 py-1 font-mono text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer',
              selectedTag
                ? 'border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground'
                : 'border-foreground bg-foreground text-background font-semibold shadow-xs'
            )}
            aria-pressed={!selectedTag}
          >
            <Layers className="size-3 text-muted-foreground group-aria-pressed:text-background" />
            <span>All Posts</span>
            <span className="text-[10px] opacity-75">[{posts.length}]</span>
          </button>

          {/* Individual Topic Badges */}
          {visibleTags.map((topic) => {
            const isSelected =
              selectedTag?.toLowerCase().trim() === topic.toLowerCase().trim()
            const count = tagCounts.get(topic.toLowerCase().trim()) ?? 0

            return (
              <button
                key={topic}
                type="button"
                onClick={() =>
                  isSelected ? handleSelectTag(null) : handleSelectTag(topic)
                }
                className={cn(
                  'group inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer',
                  isSelected
                    ? 'border-foreground bg-foreground text-background font-semibold shadow-xs'
                    : 'border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground hover:bg-muted/40'
                )}
                aria-pressed={isSelected}
                aria-label={`Filter by ${topic} (${count} posts)`}
              >
                <span
                  className={
                    isSelected
                      ? 'text-background/80 font-bold'
                      : 'text-muted-foreground/60'
                  }
                >
                  #
                </span>
                <span>{topic}</span>
                {count > 0 && (
                  <span
                    className={cn(
                      'text-[10px]',
                      isSelected
                        ? 'text-background/80 font-bold'
                        : 'text-muted-foreground'
                    )}
                  >
                    [{count < 10 ? `0${count}` : count}]
                  </span>
                )}
                {isSelected && (
                  <X className="size-3 text-background transition-transform group-hover:scale-125" />
                )}
              </button>
            )
          })}
        </div>

        {/* Active Filter Strip (Shows exact active parameters) */}
        {hasActiveFilter && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-muted/40 px-3 py-2 font-mono text-xs text-muted-foreground sm:px-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-foreground font-semibold">
                ACTIVE FILTER:
              </span>
              {selectedTag && (
                <span className="inline-flex items-center gap-1 border border-foreground bg-foreground text-background px-1.5 py-0.5 text-[10px] uppercase font-bold">
                  #{selectedTag}
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 border border-border bg-background px-1.5 py-0.5 text-[10px] text-foreground">
                  Keyword: &quot;{searchQuery}&quot;
                </span>
              )}
              <span className="text-[10px]">
                ({sortedPosts.length}{' '}
                {sortedPosts.length === 1 ? 'match' : 'matches'})
              </span>
            </div>

            <button
              type="button"
              onClick={handleClearAllFilters}
              className="inline-flex items-center gap-1 text-[11px] text-foreground underline decoration-border hover:decoration-foreground cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        )}
      </Frame>

      {/* Sort Options Panel */}
      {showFilters && (
        <Frame>
          <FrameHeader label="Sort articles by" />
          <div className="flex flex-wrap gap-2 p-3 sm:p-4">
            {sortOptions.map((option) => (
              <Button
                key={option.value}
                variant={sortBy === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setSortBy(option.value)
                  setShowFilters(false)
                }}
                className="gap-2 cursor-pointer font-mono text-xs uppercase"
              >
                {option.icon}
                {option.label}
              </Button>
            ))}
          </div>
        </Frame>
      )}

      {/* Articles Feed Frame */}
      <Frame className="overflow-visible">
        <FrameHeader label={getHeaderLabel()}>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-muted-foreground">
              {sortedPosts.length}{' '}
              {sortedPosts.length === 1 ? 'ARTICLE' : 'ARTICLES'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2 font-mono text-xs uppercase cursor-pointer"
            >
              <ArrowUpDown className="size-3.5" />
              Sort: {sortBy}
            </Button>
          </div>
        </FrameHeader>

        {sortedPosts.length === 0 ? (
          <div className="p-8 text-center sm:p-12">
            <TagIcon className="mx-auto mb-3 size-8 text-muted-foreground opacity-50" />
            <p className="font-semibold text-foreground">
              No articles match your filter criteria
            </p>
            <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
              {getEmptyMessage()}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAllFilters}
                className="font-mono text-xs uppercase cursor-pointer"
              >
                View all articles
              </Button>
              <button
                type="button"
                onClick={() => handleSelectTag('DevOps')}
                className="border border-border bg-background px-3 py-1 font-mono text-xs uppercase text-muted-foreground hover:border-foreground hover:text-foreground cursor-pointer"
              >
                #DevOps
              </button>
              <button
                type="button"
                onClick={() => handleSelectTag('AI / ML')}
                className="border border-border bg-background px-3 py-1 font-mono text-xs uppercase text-muted-foreground hover:border-foreground hover:text-foreground cursor-pointer"
              >
                #AI / ML
              </button>
              <button
                type="button"
                onClick={() => handleSelectTag('Kubernetes')}
                className="border border-border bg-background px-3 py-1 font-mono text-xs uppercase text-muted-foreground hover:border-foreground hover:text-foreground cursor-pointer"
              >
                #Kubernetes
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:gap-5 sm:p-5 lg:grid-cols-3">
            {sortedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                user={user}
                activeTag={selectedTag}
                onTagClick={(tag) => handleSelectTag(tag)}
              />
            ))}
          </div>
        )}
      </Frame>
    </div>
  )
}

export default PostsFilter
