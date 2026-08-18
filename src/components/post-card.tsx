'use client'

import type { Like, Post, User } from '@/db/schema'

import { EyeIcon, HeartIcon } from 'lucide-react'
import Link from 'next/link'
import { memo } from 'react'

import { formatPostDate } from '@/utils/format-post-date'
import { HoverMark } from '@/components/hover-mark'

import Controls from './controls'
import UserAvatar from './user-avatar'

export type PostCardProps = {
  post: Pick<Post, 'id' | 'title' | 'description' | 'published' | 'createdAt' | 'views'> & {
    likes: Array<Pick<Like, 'id'>>
    likeCount: number
  } & {
    user: Pick<User, 'name' | 'image' | 'id'>
  }
  user: User | null
  showAuthor?: boolean
}

const PostCard = memo((props: PostCardProps) => {
  const { post, user, showAuthor = true } = props
  const { id, title, description, published, createdAt, likeCount, views, user: author } =
    post

  const href = `/${published ? 'posts' : 'editor'}/${id}`
  const actionLabel = published ? 'Read article' : 'Edit draft'

  return (
    <HoverMark
      as="article"
      label={actionLabel}
      className="border-b border-border last:border-b-0"
    >
      <div className="flex items-start justify-between gap-3 px-4 pt-5 sm:px-5 sm:pt-6">
        {showAuthor && (
          <Link
            href={`/users/${author.id}`}
            className="relative z-20 flex min-w-0 flex-1 items-center gap-2.5 text-sm"
            aria-label={`View posts by ${author.name}`}
            onClick={(e) => e.stopPropagation()}
          >
            <UserAvatar
              width={28}
              height={28}
              userId={author.id}
              src={author.image}
              alt={author.name}
              className="size-7 shrink-0 border border-border"
            />
            <div className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
              <span className="truncate font-medium">{author.name}</span>
              <span
                className="hidden text-muted-foreground sm:inline"
                aria-hidden
              >
                ·
              </span>
              <time
                className="shrink-0 text-xs text-muted-foreground"
                dateTime={createdAt.toISOString()}
              >
                {formatPostDate(createdAt, { relative: true })}
              </time>
            </div>
          </Link>
        )}
        <div className="relative z-20 ml-2 shrink-0">
          <Controls
            user={user}
            id={id}
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
