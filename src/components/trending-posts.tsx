import { FlameIcon, TrendingUpIcon } from 'lucide-react'
import Link from 'next/link'

import { Frame, FrameBody, FrameHeader } from '@/components/frame'
import { HoverMark } from '@/components/hover-mark'
import UserAvatar from '@/components/user-avatar'
import { getTrendingPosts } from '@/queries/get-trending-posts'
import { formatPostDate } from '@/utils/format-post-date'

const TrendingPosts = async () => {
  const { posts } = await getTrendingPosts(5)

  if (posts.length === 0) return null

  return (
    <Frame as="section" aria-label="Trending articles">
      <FrameHeader label="Trending">
        <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <FlameIcon className="size-3.5 text-foreground" />
          <span>Top this week</span>
        </div>
      </FrameHeader>
      <FrameBody className="space-y-0 p-0">
        <div className="divide-y divide-border">
          {posts.map((post, index) => (
            <HoverMark
              key={post.id}
              label="Read article"
              className="flex items-start gap-4 px-4 py-3.5 sm:px-5"
            >
              <span
                aria-hidden
                className="mt-0.5 flex size-7 shrink-0 items-center justify-center border border-border bg-muted/50 font-mono text-xs font-bold text-muted-foreground"
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <Link
                href={`/posts/${post.id}`}
                className="min-w-0 flex-1 space-y-1"
              >
                <h3 className="text-sm font-semibold leading-snug tracking-tight text-foreground sm:text-base">
                  {post.title}
                </h3>
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted-foreground">
                  <div className="inline-flex items-center gap-1.5">
                    <UserAvatar
                      width={16}
                      height={16}
                      src={post.user.image}
                      alt={post.user.name}
                      userId={post.user.id}
                      className="size-4 border border-border"
                    />
                    <span>{post.user.name}</span>
                  </div>
                  <span aria-hidden>·</span>
                  <time dateTime={post.createdAt.toISOString()}>
                    {formatPostDate(post.createdAt, { relative: true })}
                  </time>
                  <span aria-hidden>·</span>
                  <span className="inline-flex items-center gap-1">
                    <TrendingUpIcon className="size-3" />
                    {post.views.toLocaleString()} views
                  </span>
                </div>
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-block border border-border/60 bg-background/80 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            </HoverMark>
          ))}
        </div>
      </FrameBody>
    </Frame>
  )
}

export default TrendingPosts
