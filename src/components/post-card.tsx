'use client'

import type { Like, Post, User } from '@/db/schema'

import { ClockIcon, EyeIcon, HeartIcon } from 'lucide-react'
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
    likes: Array<Pick<Like, 'id'>>
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
  const { id, title, description, published, createdAt, likeCount, views, user: author } =
    post

  const href = `/${published ? 'posts' : 'editor'}/${id}`
  const actionLabel = published ? 'Read article' : 'Edit draft'
  const readTime = readingTime(description ?? title).text
  const isNew =
    published && Date.now() - createdAt.getTime() < 7 * 24 * 60 * 60 * 1000

  return (
    <article className="hover-fill group/card relative flex flex-col justify-between border border-border bg-card transition-colors duration-150 hover:border-foreground/60">
      <CornerBrackets className="border-foreground/80 opacity-0 transition-opacity duration-150 group-hover/card:opacity-100" />

      {/* Technical Preview Banner (Hacktron style) */}
      <Link
        href={href}
        className="relative block aspect-[16/9] w-full overflow-hidden border-b border-border/80 bg-muted/40 p-4 transition-colors group-hover/card:bg-muted/70"
        tabIndex={-1}
        aria-hidden
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--color-foreground)/0.04,transparent_70%)]" />
        <div className="relative flex h-full flex-col justify-between">
          <div className="flex items-center justify-between font-mono text-[9px] tracking-widest text-muted-foreground uppercase">
            <span>DOC // {id.slice(0, 8)}</span>
            <span>{readTime}</span>
          </div>

          <div className="my-auto text-center">
            <span className="font-heading text-sm font-semibold tracking-tight text-foreground/85 line-clamp-2">
              {title}
            </span>
          </div>

          <div className="flex items-center justify-between font-mono text-[8px] text-muted-foreground/60 uppercase">
            <span>PLATFORM</span>
            <span>[ MONO-V2 ]</span>
          </div>
        </div>
      </Link>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <Link
            href={href}
            className="group/title block focus-visible:outline-none"
            aria-label={`${actionLabel}: ${title}`}
          >
            <h2 className="font-heading text-lg font-medium tracking-tight text-foreground transition-colors group-hover/title:underline sm:text-xl">
              {title}
              {isNew && (
                <span
                  className="ml-2 inline-block translate-y-[-1px] border border-foreground bg-foreground px-1 py-px align-middle font-mono text-[9px] font-semibold tracking-widest text-background"
                  aria-label="Published within the last week"
                >
                  NEW
                </span>
              )}
            </h2>
            {description && (
              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                {description}
              </p>
            )}
          </Link>

          {/* Author Row */}
          {showAuthor && (
            <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/60 pt-3">
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
                <div className="flex min-w-0 items-center gap-1.5 font-mono text-xs text-muted-foreground">
                  <span className="truncate text-foreground font-medium">{author.name}</span>
                  <span aria-hidden>·</span>
                  <time
                    dateTime={createdAt.toISOString()}
                    className="shrink-0 text-[11px]"
                  >
                    {formatPostDate(createdAt, { relative: true })}
                  </time>
                </div>
              </Link>

              <div className="relative z-20 ml-2 shrink-0">
                <Controls
                  id={id}
                  user={user}
                  authorId={author.id}
                  postTitle={title}
                />
              </div>
            </div>
          )}
        </div>

        {/* Tags + Engagement Footer */}
        <div className="mt-4 space-y-3 pt-2">
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
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
                      'hover-fill relative z-20 inline-flex items-center gap-1 border px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase transition-all duration-150 cursor-pointer',
                      isSelected
                        ? 'border-foreground bg-foreground text-background font-semibold'
                        : 'border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground'
                    )}
                    aria-pressed={isSelected}
                    aria-label={`Filter by topic: ${tag}`}
                  >
                    <span className="text-muted-foreground/60">#</span>
                    <span>{tag}</span>
                  </button>
                )
              })}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-border/60 pt-2.5 font-mono text-[11px] text-muted-foreground">
            <div className="flex items-center gap-3">
              <span
                className="inline-flex items-center gap-1"
                aria-label={`${views.toLocaleString()} views`}
              >
                <EyeIcon className="size-3" aria-hidden />
                <span>{views.toLocaleString()}</span>
              </span>
              <span
                className="inline-flex items-center gap-1"
                aria-label={`${likeCount.toLocaleString()} likes`}
              >
                <HeartIcon className="size-3" aria-hidden />
                <span>{likeCount.toLocaleString()}</span>
              </span>
            </div>

            <span className="inline-flex items-center gap-1 text-[10px]">
              <ClockIcon className="size-3" aria-hidden />
              <span>{readTime}</span>
            </span>
          </div>
        </div>
      </div>
    </article>
  )
})

PostCard.displayName = 'PostCard'

export default PostCard
