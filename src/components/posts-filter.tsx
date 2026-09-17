'use client'

import type { User } from '@/db/schema'

import { ArrowUpDown, Clock, Heart, TagIcon,TrendingUp, X } from 'lucide-react'
import { usePathname,useRouter, useSearchParams } from 'next/navigation'
import { type ReactNode, useEffect,useMemo, useState } from 'react'

import { Frame, FrameHeader } from '@/components/frame'
import PostCard, { type PostCardProps } from '@/components/post-card'
import { Button } from '@/components/ui'
import { SITE_TOPICS } from '@/lib/constants'
import { cn } from '@/utils'

type PostsFilterProps = {
  posts: Array<PostCardProps['post']>
  user: User | null
}

type SortOption = 'newest' | 'oldest' | 'popular' | 'trending'

const PostsFilter = ({ posts, user }: PostsFilterProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tagParam = searchParams.get('tag')

  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTag, setSelectedTag] = useState<string | null>(tagParam)

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

  // Derive all active tags from posts, prioritizing SITE_TOPICS
  const allTags = useMemo(() => {
    const postTagSet = new Set<string>()
    for (const p of posts) {
      if (p.tags) for (const t of p.tags) postTagSet.add(t)
    }

    return Array.from(new Set([...SITE_TOPICS, ...Array.from(postTagSet)]))
  }, [posts])

  // Count posts per tag for visual tag counts
  const tagCounts = useMemo(() => {
    const map = new Map<string, number>()
    for (const p of posts) {
      if (p.tags) for (const t of p.tags) {
        const lower = t.toLowerCase()
        map.set(lower, (map.get(lower) ?? 0) + 1)
      }
    }
    return map
  }, [posts])

  // Filter posts by selected tag
  const filteredPosts = useMemo(() => {
    if (!selectedTag) return posts
    const lower = selectedTag.toLowerCase()
    return posts.filter((post) => {
      const matchTag = post.tags?.some((t) => t.toLowerCase() === lower) ?? false
      const matchTitle = post.title.toLowerCase().includes(lower)
      const matchDesc = post.description?.toLowerCase().includes(lower) ?? false
      return matchTag || matchTitle || matchDesc
    })
  }, [posts, selectedTag])

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
        return sorted.sort((a, b) => b.likeCount - a.likeCount || b.views - a.views)
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

  return (
    <div className="w-full space-y-4">
      {/* Topics & Tag Pills Bar */}
      <Frame>
        <FrameHeader label="Browse by topic">
          {selectedTag && (
            <button
              type="button"
              onClick={() => handleSelectTag(null)}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
            >
              <X className="size-3" />
              Reset filter
            </button>
          )}
        </FrameHeader>
        <div className="flex flex-wrap items-center gap-2 p-3 sm:p-4">
          <button
            type="button"
            onClick={() => handleSelectTag(null)}
            className={cn(
              'border px-2.5 py-1 font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer',
              selectedTag
                ? 'border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground'
                : 'border-foreground bg-foreground text-background font-semibold'
            )}
          >
            All Posts ({posts.length})
          </button>
          {allTags.map((topic) => {
            const isSelected =
              selectedTag?.toLowerCase() === topic.toLowerCase()
            const count = tagCounts.get(topic.toLowerCase())

            return (
              <button
                key={topic}
                type="button"
                onClick={() =>
                  isSelected ? handleSelectTag(null) : handleSelectTag(topic)
                }
                className={cn(
                  'border px-2.5 py-1 font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer',
                  isSelected
                    ? 'border-foreground bg-foreground text-background font-semibold'
                    : 'border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground'
                )}
              >
                #{topic} {count !== undefined && count > 0 ? `(${count})` : ''}
              </button>
            )
          })}
        </div>
      </Frame>

      {/* Sort Options Panel */}
      {showFilters && (
        <Frame>
          <FrameHeader label="Sort by" />
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
                className="gap-2"
              >
                {option.icon}
                {option.label}
              </Button>
            ))}
          </div>
        </Frame>
      )}

      {/* Posts List */}
      <Frame className="overflow-visible">
        <FrameHeader
          label={
            selectedTag ? `Articles tagged with #${selectedTag}` : 'Latest posts'
          }
        >
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              {sortedPosts.length}{' '}
              {sortedPosts.length === 1 ? 'article' : 'articles'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <ArrowUpDown className="size-3.5" />
              Sort
            </Button>
          </div>
        </FrameHeader>

        {sortedPosts.length === 0 ? (
          <div className="p-8 text-center sm:p-12">
            <TagIcon className="mx-auto mb-3 size-8 text-muted-foreground opacity-50" />
            <p className="font-medium text-foreground">
              No articles found for #{selectedTag}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try selecting a different topic or clear the filter.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSelectTag(null)}
              className="mt-4"
            >
              View all articles
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {sortedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                user={user}
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
