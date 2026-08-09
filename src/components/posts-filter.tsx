'use client'

import { useState, useMemo, type ReactNode } from 'react'
import { Button } from '@/components/ui'
import { ArrowUpDown, Clock, Heart, TrendingUp } from 'lucide-react'
import PostCard, { type PostCardProps } from '@/components/post-card'
import { Frame, FrameHeader } from '@/components/frame'
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
        return sorted.sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        )
      case 'oldest':
        return sorted.sort(
          (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
        )
      case 'popular':
        return sorted.sort((a, b) => b.likes.length - a.likes.length)
      case 'trending':
        return sorted.sort((a, b) => {
          const aScore =
            a.likes.length * 10 +
            (Date.now() - a.createdAt.getTime()) / (1000 * 60 * 60 * 24)
          const bScore =
            b.likes.length * 10 +
            (Date.now() - b.createdAt.getTime()) / (1000 * 60 * 60 * 24)
          return bScore - aScore
        })
      default:
        return sorted
    }
  }, [posts, sortBy])

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

      <Frame className="overflow-visible">
        <FrameHeader label="Latest posts">
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
        <div className="divide-y divide-border">
          {sortedPosts.map((post) => (
            <PostCard key={post.id} post={post} user={user} />
          ))}
        </div>
      </Frame>
    </div>
  )
}

export default PostsFilter
