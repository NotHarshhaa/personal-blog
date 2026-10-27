'use client'

import type { Like, Post, User } from '@/db/schema'

import { ArrowUpRightIcon, ClockIcon, EyeIcon, FlameIcon, HeartIcon } from 'lucide-react'
import Link from 'next/link'
import { memo } from 'react'
import readingTime from 'reading-time'

import { CornerBrackets } from '@/components/frame'
import { cn } from '@/utils'
import { formatPostDate } from '@/utils/format-post-date'

import Controls from './controls'
import UserAvatar from './user-avatar'

export type PostCardProps = {
  post: Pick<Post, 'id' | 'title' | 'description' | 'published' | 'createdAt' | 'views'> & {
    tags?: string[]
    likes: Array<Pick<Like, 'id'> & { userId?: string }>
    likeCount: number
    content?: string | null
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
  const { id, title, description, published, createdAt, likeCount, views, user: author } = post

  const href = `/${published ? 'posts' : 'editor'}/${id}`
  const actionLabel = published ? 'Read article' : 'Edit draft'
  const readTime = readingTime(description ?? title).text
  const isNew = published && Date.now() - createdAt.getTime() < 7 * 24 * 60 * 60 * 1000
  const isPopular = published && (views >= 1000 || likeCount >= 30)
  const isUserLiked = Boolean(
    user?.id &&
    post.likes.some((like) => ('userId' in like && like.userId === user.id) || like.id === user.id)
  )

  return (
    <article
      className={cn(
        'hover-fill group/card border-border bg-card hover:border-foreground/60 relative flex flex-col border transition-colors duration-150',
        !published && 'border-dashed'
      )}
    >
      <CornerBrackets className='border-foreground/80 opacity-0 transition-opacity duration-150 group-hover/card:opacity-100' />

      {/* Blueprint status strip: doc ref + state chip + read time */}
      <Link
        href={href}
        className='border-border/80 bg-muted/30 group-hover/card:bg-muted/50 relative block overflow-hidden border-b transition-colors'
        tabIndex={-1}
        aria-hidden
      >
        <div
          aria-hidden
          className='absolute inset-0 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_80%)] [background-size:14px_14px] opacity-50 transition-opacity duration-150 group-hover/card:opacity-80'
        />
        <div className='text-muted-foreground relative flex items-center justify-between gap-2 px-4 py-2 font-mono text-[9px] tracking-widest uppercase'>
          <span className='truncate'>DOC // {id.slice(0, 8)}</span>
          <div className='flex shrink-0 items-center gap-2'>
            {!published && (
              <span className='border-muted-foreground/50 border border-dashed px-1.5 py-px text-[8px] font-semibold'>
                Draft
              </span>
            )}
            {isNew && (
              <span
                className='bg-foreground text-background px-1.5 py-px text-[8px] font-semibold'
                aria-label='Published within the last week'
              >
                New
              </span>
            )}
            <span className='inline-flex items-center gap-1'>
              <ClockIcon className='size-2.5' aria-hidden />
              {readTime}
            </span>
          </div>
        </div>
      </Link>

      {/* Main Content Area */}
      <div className='flex flex-1 flex-col p-5'>
        <Link
          href={href}
          className='group/title block focus-visible:outline-none'
          aria-label={`${actionLabel}: ${title}`}
        >
          <h2 className='font-heading text-foreground line-clamp-2 text-lg font-medium tracking-tight text-pretty transition-colors group-hover/title:underline sm:text-xl'>
            {title}
          </h2>
          {description && (
            <p className='text-muted-foreground mt-2 line-clamp-2 text-xs leading-relaxed sm:text-sm'>
              {description}
            </p>
          )}
        </Link>

        {/* Author Row */}
        {showAuthor && (
          <div className='border-border/60 mt-4 flex items-center justify-between gap-3 border-t pt-3'>
            <Link
              href={`/users/${author.id}`}
              className='group/author hover:text-foreground flex min-w-0 flex-1 items-center gap-2'
              aria-label={`View posts by ${author.name}`}
            >
              <UserAvatar
                width={20}
                height={20}
                src={author.image}
                alt={author.name}
                userId={author.id}
                className='border-border size-5 shrink-0 border'
              />
              <div className='text-muted-foreground flex min-w-0 items-center gap-1.5 font-mono text-xs'>
                <span className='text-foreground font-medium whitespace-nowrap'>{author.name}</span>
                <span aria-hidden>·</span>
                <time
                  dateTime={createdAt.toISOString()}
                  className='shrink-0 text-[11px] whitespace-nowrap'
                >
                  {formatPostDate(createdAt, { relative: true })}
                </time>
              </div>
            </Link>

            <div className='relative z-20 ml-2 shrink-0'>
              <Controls id={id} user={user} authorId={author.id} postTitle={title} />
            </div>
          </div>
        )}

        {/* Tags + Engagement Footer (pinned to card bottom for even grid rows) */}
        <div className='mt-auto space-y-3 pt-4'>
          {post.tags && post.tags.length > 0 && (
            <div className='flex flex-wrap gap-1.5'>
              {post.tags.map((tag) => {
                const isSelected =
                  Boolean(activeTag) && activeTag?.toLowerCase().trim() === tag.toLowerCase().trim()

                return (
                  <button
                    key={tag}
                    type='button'
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
                      'hover-fill relative z-20 inline-flex cursor-pointer items-center gap-1 border px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase transition-all duration-150',
                      isSelected
                        ? 'border-foreground bg-foreground text-background font-semibold'
                        : 'border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground'
                    )}
                    aria-pressed={isSelected}
                    aria-label={`Filter by topic: ${tag}`}
                  >
                    <span className='text-muted-foreground/60'>#</span>
                    <span>{tag}</span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Engagement Footer: plain stats + hover CTA */}
          <div className='border-border/60 flex items-center justify-between gap-2 border-t pt-3 font-mono text-[11px]'>
            <div className='flex items-center gap-4'>
              <span
                className='inline-flex items-center gap-1.5'
                title={`${views.toLocaleString()} total reads${isPopular ? ' · High engagement' : ''}`}
                aria-label={`${views.toLocaleString()} views`}
              >
                {isPopular ? (
                  <FlameIcon className='size-3.5 text-amber-500' aria-hidden />
                ) : (
                  <EyeIcon
                    className='text-muted-foreground/70 group-hover/card:text-foreground size-3.5 transition-colors'
                    aria-hidden
                  />
                )}
                <span className='text-foreground font-semibold tabular-nums'>
                  {views.toLocaleString()}
                </span>
              </span>

              <span
                className={cn(
                  'inline-flex items-center gap-1.5',
                  isUserLiked && 'text-rose-600 dark:text-rose-400'
                )}
                title={`${likeCount.toLocaleString()} likes${isUserLiked ? ' · You liked this' : ''}`}
                aria-label={`${likeCount.toLocaleString()} likes`}
              >
                <HeartIcon
                  className={cn(
                    'size-3.5 transition-transform duration-150',
                    isUserLiked
                      ? 'fill-rose-500 text-rose-500'
                      : 'text-muted-foreground/70 group-hover/card:scale-110 group-hover/card:text-rose-500'
                  )}
                  aria-hidden
                />
                <span
                  className={cn('font-semibold tabular-nums', !isUserLiked && 'text-foreground')}
                >
                  {likeCount.toLocaleString()}
                </span>
              </span>
            </div>

            <span
              aria-hidden
              className='text-muted-foreground/60 group-hover/card:text-foreground inline-flex items-center gap-1 text-[10px] font-semibold tracking-widest uppercase transition-colors duration-150'
            >
              {published ? 'Read' : 'Edit'}
              <ArrowUpRightIcon
                className='size-3 transition-transform duration-150 group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5'
                aria-hidden
              />
            </span>
          </div>
        </div>
      </div>
    </article>
  )
})

PostCard.displayName = 'PostCard'

export default PostCard
