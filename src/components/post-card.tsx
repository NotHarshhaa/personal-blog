'use client'

import type { Like, Post, User } from '@/db/schema'

import { ArrowUpRightIcon, ClockIcon, EyeIcon, FlameIcon, HeartIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { memo } from 'react'
import readingTime from 'reading-time'

import { CornerBrackets, StripHeader } from '@/components/frame'
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
  featured?: boolean
}

const PostCardHeaderStrip = ({
  href,
  id,
  featured,
  published,
  isNew,
  readTime
}: {
  href: string
  id: string
  featured: boolean
  published: boolean
  isNew: boolean
  readTime: string
}) => (
  <Link href={href} className='relative block' tabIndex={-1} aria-hidden>
    <StripHeader
      left={
        <span className='flex items-center gap-2 truncate'>
          <span>DOC // {id.slice(0, 8)}</span>
          {featured && (
            <span className='border-border bg-background text-foreground border px-1.5 py-px text-[8px] font-semibold'>
              Featured
            </span>
          )}
        </span>
      }
      right={
        <>
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
        </>
      }
      className='group-hover/card:bg-muted/50 transition-colors'
    />
  </Link>
)

const PostCardMetaRow = ({
  showAuthor,
  author,
  createdAt,
  id,
  user,
  title
}: {
  showAuthor: boolean
  author: PostCardProps['post']['user']
  createdAt: Date
  id: string
  user: User | null
  title: string
}) => (
  <div className='mt-4 flex items-center justify-between gap-3 pt-1'>
    {showAuthor ? (
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
    ) : (
      <time
        dateTime={createdAt.toISOString()}
        className='text-muted-foreground font-mono text-[11px] whitespace-nowrap'
      >
        {formatPostDate(createdAt, { relative: true })}
      </time>
    )}

    <div className='relative z-20 ml-2 shrink-0'>
      <Controls id={id} user={user} authorId={author.id} postTitle={title} />
    </div>
  </div>
)

const PostCardFooter = ({
  tags,
  activeTag,
  onTagSelect,
  views,
  likeCount,
  isPopular,
  isUserLiked,
  published
}: {
  tags?: string[]
  activeTag?: string | null
  onTagSelect: (tag: string) => void
  views: number
  likeCount: number
  isPopular: boolean
  isUserLiked: boolean
  published: boolean
}) => (
  <div className='mt-auto space-y-3 pt-4'>
    {tags && tags.length > 0 && (
      <div className='flex flex-wrap gap-1.5'>
        {tags.map((tag) => {
          const isSelected =
            Boolean(activeTag) && activeTag?.toLowerCase().trim() === tag.toLowerCase().trim()

          return (
            <button
              key={tag}
              type='button'
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onTagSelect(tag)
              }}
              className={cn(
                'hover-fill focus-visible:ring-foreground/50 relative z-20 inline-flex cursor-pointer items-center gap-1 border px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase transition-[color,background-color,border-color] duration-150 focus-visible:ring-2 focus-visible:outline-none',
                isSelected
                  ? 'border-foreground bg-foreground text-background font-semibold'
                  : 'border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground'
              )}
              aria-pressed={isSelected}
              aria-label={`Filter by topic: ${tag}`}
            >
              <span className={isSelected ? 'text-background/80' : 'text-muted-foreground/80'}>
                #
              </span>
              <span>{tag}</span>
            </button>
          )
        })}
      </div>
    )}

    <div className='border-border flex items-center justify-between gap-2 border-t pt-3 font-mono text-[11px]'>
      <div className='flex items-center gap-4'>
        <span
          className='inline-flex items-center gap-1.5'
          title={`${views.toLocaleString()} total reads${isPopular ? ' · High engagement' : ''}`}
          aria-label={`${views.toLocaleString()} views`}
        >
          {isPopular ? (
            <FlameIcon className='text-warning size-3.5' aria-hidden />
          ) : (
            <EyeIcon
              className='text-muted-foreground group-hover/card:text-foreground size-3.5 transition-colors'
              aria-hidden
            />
          )}
          <span className='text-foreground font-semibold tabular-nums'>
            {views.toLocaleString()}
          </span>
        </span>

        <span
          className={cn('inline-flex items-center gap-1.5', isUserLiked && 'text-destructive')}
          title={`${likeCount.toLocaleString()} likes${isUserLiked ? ' · You liked this' : ''}`}
          aria-label={`${likeCount.toLocaleString()} likes`}
        >
          <HeartIcon
            className={cn(
              'size-3.5 transition-transform duration-150',
              isUserLiked
                ? 'fill-destructive text-destructive'
                : 'text-muted-foreground group-hover/card:text-destructive group-hover/card:scale-110'
            )}
            aria-hidden
          />
          <span className={cn('font-semibold tabular-nums', !isUserLiked && 'text-foreground')}>
            {likeCount.toLocaleString()}
          </span>
        </span>
      </div>

      <span
        aria-hidden
        className='text-muted-foreground group-hover/card:text-foreground inline-flex items-center gap-1 text-[10px] font-semibold tracking-widest uppercase transition-colors duration-150'
      >
        {published ? 'Read' : 'Edit'}
        <ArrowUpRightIcon
          className='size-3 transition-transform duration-150 group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5'
          aria-hidden
        />
      </span>
    </div>
  </div>
)

const PostCard = memo((props: PostCardProps) => {
  const { post, user, showAuthor = true, activeTag, featured = false, onTagClick } = props
  const { id, title, description, published, createdAt, likeCount, views, user: author } = post
  const router = useRouter()

  const href = `/${published ? 'posts' : 'editor'}/${id}`
  const actionLabel = published ? 'Read article' : 'Edit draft'
  const readTime = readingTime(description ?? title).text
  const isNew = published && Date.now() - createdAt.getTime() < 7 * 24 * 60 * 60 * 1000
  const isPopular = published && (views >= 1000 || likeCount >= 30)
  const isUserLiked = Boolean(
    user?.id &&
    post.likes.some((like) => ('userId' in like && like.userId === user.id) || like.id === user.id)
  )

  const handleTagSelect = (tag: string) => {
    if (onTagClick) {
      onTagClick(tag)
    } else {
      router.push(`/?tag=${encodeURIComponent(tag)}`)
    }
  }

  return (
    <article
      data-panel
      data-panel-interactive
      className={cn(
        'hover-fill group/card border-border bg-card hover:border-border-strong relative flex flex-col border transition-[border-color,box-shadow,transform] duration-200 ease-out',
        'hover:-translate-y-0.5',
        'focus-within:border-foreground',
        !published && 'border-dashed'
      )}
    >
      <CornerBrackets className='border-foreground/85 opacity-0 transition-opacity duration-150 group-focus-within/card:opacity-100 group-hover/card:opacity-100' />

      <PostCardHeaderStrip
        href={href}
        id={id}
        featured={featured}
        published={published}
        isNew={isNew}
        readTime={readTime}
      />

      {/* Main Content Area */}
      <div className={cn('flex flex-1 flex-col', featured ? 'p-5 sm:p-6' : 'p-5')}>
        <Link
          href={href}
          className='group/title block focus-visible:outline-none'
          aria-label={`${actionLabel}: ${title}`}
        >
          <h2
            className={cn(
              'font-heading text-foreground font-medium tracking-tight text-pretty transition-colors group-hover/title:underline',
              featured ? 'line-clamp-2 text-xl sm:text-2xl' : 'line-clamp-2 text-lg sm:text-xl'
            )}
          >
            {title}
          </h2>
          {description && (
            <p
              className={cn(
                'text-muted-foreground mt-2 text-xs leading-relaxed sm:text-sm',
                featured ? 'line-clamp-3 max-w-3xl' : 'line-clamp-2'
              )}
            >
              {description}
            </p>
          )}
        </Link>

        <PostCardMetaRow
          showAuthor={showAuthor}
          author={author}
          createdAt={createdAt}
          id={id}
          user={user}
          title={title}
        />

        <PostCardFooter
          tags={post.tags}
          activeTag={activeTag}
          onTagSelect={handleTagSelect}
          views={views}
          likeCount={likeCount}
          isPopular={isPopular}
          isUserLiked={isUserLiked}
          published={published}
        />
      </div>
    </article>
  )
})

PostCard.displayName = 'PostCard'

export default PostCard
