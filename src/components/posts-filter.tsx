'use client'

import type { User } from '@/db/schema'

import {
  ChevronDown,
  ChevronUp,
  Clock,
  Heart,
  History,
  Layers,
  Search,
  TagIcon,
  TrendingUp,
  X
} from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { type ReactNode, useEffect, useMemo, useState } from 'react'

import { Frame, StripHeader } from '@/components/frame'
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

const MAX_VISIBLE_TAGS = 12

const AI_TOPICS = new Set([
  'ai / ml',
  'ai infrastructure',
  'llmops',
  'mlops',
  'genai',
  'productivity'
])

const DEVOPS_TOPICS = new Set(['devops', 'cloud', 'platform engineering', 'ci/cd', 'automation'])

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
  const [selectedTag, setSelectedTag] = useState<string | null>(tagParam)
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAllTags, setShowAllTags] = useState(false)

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
            return tl === lowerTag || tl.includes(lowerTag) || lowerTag.includes(tl)
          }) ?? false
        const matchTitle = post.title.toLowerCase().includes(lowerTag)
        const matchDesc = post.description?.toLowerCase().includes(lowerTag) ?? false
        return matchTag || matchTitle || matchDesc
      })
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter((post) => {
        const matchTitle = post.title.toLowerCase().includes(q)
        const matchDesc = post.description?.toLowerCase().includes(q) ?? false
        const matchTags = post.tags?.some((t) => t.toLowerCase().includes(q)) ?? false
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
        return sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      }
      case 'oldest': {
        return sorted.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
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
    { value: 'newest', label: 'Newest', icon: <Clock className='size-3' /> },
    { value: 'oldest', label: 'Oldest', icon: <History className='size-3' /> },
    {
      value: 'popular',
      label: 'Most Liked',
      icon: <Heart className='size-3' />
    },
    {
      value: 'trending',
      label: 'Trending',
      icon: <TrendingUp className='size-3' />
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

  // Keep an active tag pill visible even when the cloud is collapsed
  const expandedTags = showAllTags || Boolean(selectedTag)
  const tagsToShow = expandedTags ? visibleTags : visibleTags.slice(0, MAX_VISIBLE_TAGS)
  const hiddenTagCount = visibleTags.length - tagsToShow.length

  return (
    <div className='w-full space-y-4'>
      {/* Blueprint Topics & Tag Filtering Hub */}
      <Frame className='relative overflow-visible'>
        <StripHeader
          left={
            <>
              <Layers className='text-foreground size-3' aria-hidden />
              <span className='text-foreground font-semibold'>Topic navigator // filter</span>
            </>
          }
          right={
            <>
              <span>{allTags.length} topics</span>
              {hasActiveFilter && (
                <button
                  type='button'
                  onClick={handleClearAllFilters}
                  className='border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground inline-flex cursor-pointer items-center gap-1 border px-2 py-px text-[9px] font-semibold transition-colors'
                  aria-label='Clear all filters'
                >
                  <X className='size-2.5' aria-hidden />
                  Reset
                </button>
              )}
            </>
          }
        />

        {/* Category Tabs & Quick Search Input */}
        <div className='border-border bg-muted/20 border-b px-3 py-2.5 sm:px-4'>
          <div className='flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between'>
            {/* Category Filter Tabs */}
            <div className='flex flex-wrap items-center gap-1.5' role='tablist'>
              {CATEGORY_TABS.map((tab) => {
                const isTabActive = activeCategory === tab.id
                return (
                  <button
                    key={tab.id}
                    type='button'
                    onClick={() => setActiveCategory(tab.id)}
                    className={cn(
                      'cursor-pointer border px-2.5 py-1 font-mono text-[11px] tracking-wider uppercase transition-all duration-150',
                      isTabActive
                        ? 'border-foreground bg-foreground text-background font-semibold shadow-xs'
                        : 'border-border/80 bg-background text-muted-foreground hover:border-foreground/60 hover:text-foreground'
                    )}
                    role='tab'
                    aria-selected={isTabActive}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Quick Keyword Filter Input */}
            <div className='relative w-full sm:w-64'>
              <Search className='text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2' />
              <input
                type='text'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Filter articles...'
                className='border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:border-foreground h-7.5 w-full border pr-7 pl-8 font-mono text-xs transition-colors outline-none'
              />
              {searchQuery && (
                <button
                  type='button'
                  onClick={() => setSearchQuery('')}
                  className='text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer'
                  aria-label='Clear search filter'
                >
                  <X className='size-3' />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tag Pills Cloud (collapsed to a compact set by default) */}
        <div className='flex flex-wrap items-center gap-2 p-3 sm:p-4'>
          {/* All Posts Reset Pill */}
          <button
            type='button'
            onClick={() => handleSelectTag(null)}
            className={cn(
              'group inline-flex cursor-pointer items-center gap-1.5 border px-3 py-1 font-mono text-xs tracking-wider uppercase transition-all duration-150',
              selectedTag
                ? 'border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground'
                : 'border-foreground bg-foreground text-background font-semibold shadow-xs'
            )}
            aria-pressed={!selectedTag}
          >
            <Layers className='text-muted-foreground group-aria-pressed:text-background size-3' />
            <span>All Posts</span>
            <span className='text-[10px] opacity-75'>[{posts.length}]</span>
          </button>

          {/* Individual Topic Badges */}
          {tagsToShow.map((topic) => {
            const isSelected = selectedTag?.toLowerCase().trim() === topic.toLowerCase().trim()
            const count = tagCounts.get(topic.toLowerCase().trim()) ?? 0

            return (
              <button
                key={topic}
                type='button'
                onClick={() => (isSelected ? handleSelectTag(null) : handleSelectTag(topic))}
                className={cn(
                  'group inline-flex cursor-pointer items-center gap-1.5 border px-2.5 py-1 font-mono text-xs tracking-wider uppercase transition-all duration-150',
                  isSelected
                    ? 'border-foreground bg-foreground text-background font-semibold shadow-xs'
                    : 'border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground hover:bg-muted/40'
                )}
                aria-pressed={isSelected}
                aria-label={`Filter by ${topic} (${count} posts)`}
              >
                <span
                  className={
                    isSelected ? 'text-background/80 font-bold' : 'text-muted-foreground/60'
                  }
                >
                  #
                </span>
                <span>{topic}</span>
                {count > 0 && (
                  <span
                    className={cn(
                      'text-[10px]',
                      isSelected ? 'text-background/80 font-bold' : 'text-muted-foreground'
                    )}
                  >
                    [{count < 10 ? `0${count}` : count}]
                  </span>
                )}
                {isSelected && (
                  <X className='text-background size-3 transition-transform group-hover:scale-125' />
                )}
              </button>
            )
          })}

          {/* Cloud Expander */}
          {hiddenTagCount > 0 && (
            <button
              type='button'
              onClick={() => setShowAllTags((v) => !v)}
              className='border-border text-muted-foreground hover:border-foreground hover:text-foreground inline-flex cursor-pointer items-center gap-1 border border-dashed px-2.5 py-1 font-mono text-xs tracking-wider uppercase transition-colors'
              aria-expanded={expandedTags}
            >
              {expandedTags ? (
                <>
                  <ChevronUp className='size-3' aria-hidden />
                  <span>Show less</span>
                </>
              ) : (
                <>
                  <ChevronDown className='size-3' aria-hidden />
                  <span>+{hiddenTagCount} more</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Active Filter Strip (Shows exact active parameters) */}
        {hasActiveFilter && (
          <div className='border-border bg-muted/40 text-muted-foreground flex flex-wrap items-center justify-between gap-2 border-t px-3 py-2 font-mono text-xs sm:px-4'>
            <div className='flex flex-wrap items-center gap-2'>
              <span className='text-foreground text-[10px] font-semibold tracking-widest uppercase'>
                ACTIVE FILTER:
              </span>
              {selectedTag && (
                <span className='border-foreground bg-foreground text-background inline-flex items-center gap-1 border px-1.5 py-0.5 text-[10px] font-bold uppercase'>
                  #{selectedTag}
                </span>
              )}
              {searchQuery && (
                <span className='border-border bg-background text-foreground inline-flex items-center gap-1 border px-1.5 py-0.5 text-[10px]'>
                  Keyword: &quot;{searchQuery}&quot;
                </span>
              )}
              <span className='text-[10px]'>
                ({sortedPosts.length} {sortedPosts.length === 1 ? 'match' : 'matches'})
              </span>
            </div>

            <button
              type='button'
              onClick={handleClearAllFilters}
              className='text-foreground decoration-border hover:decoration-foreground inline-flex cursor-pointer items-center gap-1 text-[11px] underline'
            >
              Clear filters
            </button>
          </div>
        )}
      </Frame>

      {/* Articles Feed Frame */}
      <Frame className='overflow-visible'>
        <StripHeader
          left={<span className='text-foreground font-semibold'>{getHeaderLabel()}</span>}
          right={
            <span>
              {sortedPosts.length} {sortedPosts.length === 1 ? 'article' : 'articles'}
            </span>
          }
        />

        {/* Inline Sort Toolbar */}
        <div className='border-border bg-muted/20 flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2 sm:px-4'>
          <span className='text-muted-foreground font-mono text-[10px] tracking-widest uppercase'>
            Sort
          </span>
          <div className='flex flex-wrap items-center gap-1'>
            {sortOptions.map((option) => {
              const isActive = sortBy === option.value
              return (
                <button
                  key={option.value}
                  type='button'
                  onClick={() => setSortBy(option.value)}
                  className={cn(
                    'inline-flex cursor-pointer items-center gap-1.5 border px-2 py-1 font-mono text-[10px] tracking-wider uppercase transition-all duration-150',
                    isActive
                      ? 'border-foreground bg-foreground text-background font-semibold shadow-xs'
                      : 'border-border/70 bg-background text-muted-foreground hover:border-foreground hover:text-foreground'
                  )}
                  aria-pressed={isActive}
                >
                  {option.icon}
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>

        {sortedPosts.length === 0 ? (
          <div className='p-8 text-center sm:p-12'>
            <TagIcon className='text-muted-foreground mx-auto mb-3 size-8 opacity-50' />
            <p className='text-foreground font-semibold'>No articles match your filter criteria</p>
            <p className='text-muted-foreground mx-auto mt-1 max-w-sm text-xs leading-relaxed'>
              {getEmptyMessage()}
            </p>
            <div className='mt-4 flex flex-wrap justify-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={handleClearAllFilters}
                className='cursor-pointer font-mono text-xs uppercase'
              >
                View all articles
              </Button>
              <button
                type='button'
                onClick={() => handleSelectTag('DevOps')}
                className='border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground cursor-pointer border px-3 py-1 font-mono text-xs uppercase'
              >
                #DevOps
              </button>
              <button
                type='button'
                onClick={() => handleSelectTag('AI / ML')}
                className='border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground cursor-pointer border px-3 py-1 font-mono text-xs uppercase'
              >
                #AI / ML
              </button>
              <button
                type='button'
                onClick={() => handleSelectTag('Kubernetes')}
                className='border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground cursor-pointer border px-3 py-1 font-mono text-xs uppercase'
              >
                #Kubernetes
              </button>
            </div>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:gap-5 sm:p-5 lg:grid-cols-3'>
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
