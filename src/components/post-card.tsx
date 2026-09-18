'use client'

import type { Like, Post, User } from '@/db/schema'

import { EyeIcon, HeartIcon } from 'lucide-react'
import Link from 'next/link'
import { memo } from 'react'

import { HoverMark } from '@/components/hover-mark'
import { cn } from '@/utils'
import { formatPostDate } from '@/utils/format-post-date'

import Controls from './controls'
import UserAvatar from './user-avatar'

export type PostCardProps = {
  post: Pick<Post, 'id' | 'title' | 'description' | 'published' | 'createdAt' | 'views'> & {
    tags?: string[]
    likes: Array<Pick<Like, 'id'>>
    likeCount: number
  } & {
    user: Pick<User, 'name' | 'image' | 'id'>
  }
  user: User | null
  showAuthor?: boolean
  activeTag?: string | null
  onTagClick?: (tag: string) => void
}

const PostCard = memo((props: PostCardProps) => {
  const { post, user, showAuthor = true, activeTag } = props
  const { id, title, description, published, createdAt, likeCount, views, user: author } =
    post

  const href = `/${published ? 'posts' : 'editor'}/${id}`
  const actionLabel = published ? 'Read article' : 'Edit draft'

  return (
    <HoverMark
      as="article"
      label={actionLabel}
      className="relative flex flex-col justify-between"
    >
      <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2 sm:px-5">
        {showAuthor ? (
          <Link
            href={`/users/${author.id}`}
            className="group/author flex min-w-0 flex-1 items-center gap-2 hover:text-foreground"
            aria-label={`View posts by ${author.name}`}
          >
            <UserAvatar
              width={20}
              height={20}
              src={author.image}
              alt={author.name}
              userId={author.id}
              className="size-5 border border-border"
            />
            <div className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
              <span className="truncate font-medium">{author.name}</span>
              <span className="hidden text-muted-foreground sm:inline" aria-hidden>
                ·
              </span>
              <time
                dateTime={createdAt.toISOString()}
                className="shrink-0 text-xs text-muted-foreground"
              >
                {formatPostDate(createdAt, { relative: true })}
              </time>
            </div>
          </Link>
        ) : (
          <time
            dateTime={createdAt.toISOString()}
            className="text-xs text-muted-foreground"
          >
            {formatPostDate(createdAt, { relative: true })}
          </time>
        )}

        <div className="relative z-20 ml-2 shrink-0">
          <Controls
            id={id}
            user={user}
            authorId={author.id}
            postTitle={title}
          />
        </div>
      </div>

      <Link
        href={href}
        className="block px-4 pt-3 pb-5 focus-visible:outline-none sm:px-5 sm:pb-6"
        tabIndex={0}
        aria-label={`${actionLabel}: ${title}`}
      >
        <h2 className="text-lg font-semibold tracking-tight text-balance sm:text-xl">
          {title}
        </h2>
        {description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {description}
          </p>
        )}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => {
              const isSelected =
                Boolean(activeTag) &&
                activeTag?.toLowerCase().trim() === tag.toLowerCase().trim()

              return (
                <button
                  key={tag}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (props.onTagClick) {
                      props.onTagClick(tag)
                    } else {
                      globalThis.location.href = `/?tag=${encodeURIComponent(tag)}`
                    }
                  }}
                  className={cn(
                    'relative z-20 inline-flex items-center gap-1 border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider transition-all duration-150 cursor-pointer',
                    isSelected
                      ? 'border-foreground bg-foreground text-background font-semibold shadow-xs'
                      : 'border-border/80 bg-background/80 text-muted-foreground hover:border-foreground hover:bg-muted/50 hover:text-foreground'
                  )}
                  aria-pressed={isSelected}
                  aria-label={`Filter by topic: ${tag}`}
                >
                  <span
                    className={
                      isSelected ? 'text-background/70' : 'text-muted-foreground/60'
                    }
                  >
                    #
                  </span>
                  <span>{tag}</span>
                </button>
              )
            })}
          </div>
        )}
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <span
            className="inline-flex items-center gap-1.5"
            aria-label={`${views.toLocaleString()} views`}
          >
            <EyeIcon className="size-3.5" aria-hidden />
            <span>{views.toLocaleString()}</span>
          </span>
          <span
            className="inline-flex items-center gap-1.5"
            aria-label={`${likeCount.toLocaleString()} likes`}
          >
            <HeartIcon className="size-3.5" aria-hidden />
            <span>{likeCount.toLocaleString()}</span>
          </span>
        </div>
      </Link>
    </HoverMark>
  )
})

PostCard.displayName = 'PostCard'

export default PostCard
