'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui'
import { ArrowUpDown, Clock, Heart, TrendingUp } from 'lucide-react'
import PostCard, { type PostCardProps } from '@/components/post-card'
import type { User } from '@/db/schema'

type PostsFilterProps = {
  posts: Array<PostCardProps['post']>
  user: User | null
}

type SortOption = 'newest' | 'oldest' | 'popular' | 'trending'

const PostsFilter = ({ posts, user }: PostsFilterProps) => {
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [showFilters, setShowFilters] = useState(false)

  const sortedPosts = useMemo(() => {
    const sorted = [...posts]

    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      case 'oldest':
        return sorted.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      case 'popular':
        return sorted.sort((a, b) => b.likes.length - a.likes.length)
      case 'trending':
        // Combine likes and recency for trending
        return sorted.sort((a, b) => {
          const aScore = a.likes.length * 10 + (Date.now() - a.createdAt.getTime()) / (1000 * 60 * 60 * 24)
          const bScore = b.likes.length * 10 + (Date.now() - b.createdAt.getTime()) / (1000 * 60 * 60 * 24)
          return bScore - aScore
        })
      default:
        return sorted
    }
  }, [posts, sortBy])

  const sortOptions: Array<{ value: SortOption; label: string; icon: React.ReactNode }> = [
    { value: 'newest', label: 'Newest', icon: <Clock className="size-4" /> },
    { value: 'oldest', label: 'Oldest', icon: <Clock className="size-4" /> },
    { value: 'popular', label: 'Most Liked', icon: <Heart className="size-4" /> },
    { value: 'trending', label: 'Trending', icon: <TrendingUp className="size-4" /> }
  ]

  return (
    <div className="w-full">
      {/* Filter Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {sortedPosts.length} {sortedPosts.length === 1 ? 'post' : 'posts'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <ArrowUpDown className="size-4" />
            <span className="hidden sm:inline">Sort</span>
          </Button>
        </div>
      </div>

      {/* Sort Options */}
      {showFilters && (
        <div className="mb-6 flex flex-wrap gap-2 rounded-lg border border-border/40 bg-white/90 dark:bg-zinc-900/90 p-4">
          {sortOptions.map((option) => (
            <Button
              key={option.value}
              variant={sortBy === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setSortBy(option.value)
                setShowFilters(false)
              }}
              className="flex items-center gap-2"
            >
              {option.icon}
              {option.label}
            </Button>
          ))}
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {sortedPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            user={user}
          />
        ))}
      </div>
    </div>
  )
}

export default PostsFilter

