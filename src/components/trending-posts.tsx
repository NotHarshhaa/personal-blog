import { FlameIcon, TrendingUpIcon } from 'lucide-react'
import Link from 'next/link'

import { Frame, StripHeader } from '@/components/frame'
import { HoverMark } from '@/components/hover-mark'
import UserAvatar from '@/components/user-avatar'
import { getTrendingPosts } from '@/queries/get-trending-posts'
import { cn } from '@/utils'
import { formatPostDate } from '@/utils/format-post-date'

const TrendingPosts = async () => {
  const { posts } = await getTrendingPosts(5)

  if (posts.length === 0) return null

  return (
    <Frame as='section' aria-label='Trending articles'>
      <StripHeader
        left={
          <>
            <FlameIcon className='text-foreground size-3' aria-hidden />
            <span className='text-foreground font-semibold'>Trending // Top this week</span>
          </>
        }
        right={<span>{posts.length} entries</span>}
      />
      <div className='divide-border divide-y'>
        {posts.map((post, index) => {
          const isTopThree = index < 3

          return (
            <HoverMark
              key={post.id}
              label='Read article'
              className='group/row flex items-start gap-4 px-4 py-3.5 sm:px-5'
            >
              <span
                aria-hidden
                className={cn(
                  'mt-0.5 flex size-7 shrink-0 items-center justify-center border font-mono text-xs font-bold',
                  isTopThree
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border bg-muted/50 text-muted-foreground'
                )}
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <Link href={`/posts/${post.id}`} className='min-w-0 flex-1 space-y-1'>
                <h3 className='text-foreground text-sm leading-snug font-semibold tracking-tight sm:text-base'>
                  {post.title}
                </h3>
                <div className='text-muted-foreground flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs'>
                  <div className='inline-flex items-center gap-1.5'>
                    <UserAvatar
                      width={16}
                      height={16}
                      src={post.user.image}
                      alt={post.user.name}
                      userId={post.user.id}
                      className='border-border size-4 border'
                    />
                    <span>{post.user.name}</span>
                  </div>
                  <span aria-hidden>·</span>
                  <time dateTime={post.createdAt.toISOString()}>
                    {formatPostDate(post.createdAt, { relative: true })}
                  </time>
                  <span aria-hidden>·</span>
                  <span className='inline-flex items-center gap-1'>
                    {isTopThree ? (
                      <FlameIcon className='size-3 text-amber-500' aria-hidden />
                    ) : (
                      <TrendingUpIcon className='size-3' aria-hidden />
                    )}
                    <span className='text-foreground font-semibold tabular-nums'>
                      {post.views.toLocaleString()}
                    </span>
                    <span className='hidden sm:inline'>views</span>
                  </span>
                  <span aria-hidden className='hidden sm:inline'>
                    ·
                  </span>
                  <span className='hidden items-center gap-1 sm:inline-flex'>
                    {post.likeCount.toLocaleString()}
                    <span>likes</span>
                  </span>
                </div>
                {post.tags.length > 0 && (
                  <div className='flex flex-wrap gap-1 pt-0.5'>
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className='border-border/60 bg-background/80 text-muted-foreground inline-block border px-1.5 py-0.5 font-mono text-[9px] tracking-wider uppercase'
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
              <TrendingUpIcon
                aria-hidden
                className='text-muted-foreground/50 mt-1 size-3.5 shrink-0 opacity-0 transition-all duration-150 group-hover/row:translate-x-0.5 group-hover/row:opacity-100'
              />
            </HoverMark>
          )
        })}
      </div>
    </Frame>
  )
}

export default TrendingPosts
