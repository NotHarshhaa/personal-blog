import { ClockIcon, EyeIcon, HeartIcon } from 'lucide-react'
import Link from 'next/link'
import readingTime from 'reading-time'

import { Frame, FrameHeader } from '@/components/frame'
import UserAvatar from '@/components/user-avatar'
import { getPosts } from '@/queries/get-posts'
import { formatPostDate } from '@/utils/format-post-date'

type RelatedPostsProps = {
  currentPostId: string
  currentPostTags: string[]
}

const RelatedPosts = async ({ currentPostId, currentPostTags }: RelatedPostsProps) => {
  const { posts } = await getPosts()

  const candidates = posts
    .filter((post) => post.id !== currentPostId)
    .map((post) => {
      const sharedTags = post.tags.filter((tag) =>
        currentPostTags.some(
          (currentTag) => currentTag.trim().toLowerCase() === tag.trim().toLowerCase()
        )
      )

      return {
        post: {
          ...post,
          createdAt: new Date(post.createdAt)
        },
        sharedTags,
        score: sharedTags.length
      }
    })

  const relevant = candidates.filter((item) => item.score > 0)
  const relatedPosts = (relevant.length > 0 ? relevant : candidates)
    .sort((a, b) => b.score - a.score || b.post.createdAt.getTime() - a.post.createdAt.getTime())
    .slice(0, 3)

  if (relatedPosts.length === 0) return null

  return (
    <Frame>
      <FrameHeader label='Related posts' />
      <div className='divide-border divide-y'>
        {relatedPosts.map(({ post, sharedTags }, index) => {
          const readTime = readingTime(post.description ?? post.title).text

          return (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              data-hover-label='Read'
              className='hover-hatch group/related flex items-center gap-3.5 p-4 transition-colors sm:gap-4 sm:p-5'
            >
              {/* Compact technical preview banner */}
              <div className='border-border/80 bg-muted/40 text-muted-foreground group-hover/related:bg-muted/70 flex aspect-[16/9] w-24 shrink-0 flex-col justify-between overflow-hidden border p-1.5 font-mono text-[8px] tracking-widest uppercase transition-colors sm:w-36 sm:p-2'>
                <span className='flex items-center justify-between gap-1'>
                  <span>DOC</span>
                  <span className='truncate'>{post.id.slice(0, 6)}</span>
                </span>
                <span className='text-foreground/50 text-center' aria-hidden>
                  :::
                </span>
                <span className='text-muted-foreground/70 flex items-center justify-between gap-1'>
                  <span>REF</span>
                  <span>[{String(index + 1).padStart(2, '0')}]</span>
                </span>
              </div>

              {/* Content */}
              <div className='min-w-0 flex-1'>
                <h3 className='font-heading text-foreground text-sm font-medium tracking-tight transition-colors group-hover/related:underline sm:text-base'>
                  {post.title}
                </h3>
                {post.description && (
                  <p className='text-muted-foreground mt-1 line-clamp-1 text-xs leading-relaxed'>
                    {post.description}
                  </p>
                )}

                {sharedTags.length > 0 && (
                  <ul className='mt-2 flex flex-wrap gap-1' aria-label='Shared topics'>
                    {sharedTags.slice(0, 3).map((tag) => (
                      <li
                        key={tag}
                        className='border-border/70 text-muted-foreground border px-1.5 py-0.5 font-mono text-[9px] tracking-wide uppercase'
                      >
                        #{tag}
                      </li>
                    ))}
                  </ul>
                )}

                <div className='mt-2 flex flex-wrap items-center justify-between gap-2'>
                  <div className='text-muted-foreground flex min-w-0 items-center gap-1.5 font-mono text-[11px]'>
                    <UserAvatar
                      width={16}
                      height={16}
                      src={post.user.image}
                      alt={post.user.name}
                      userId={post.user.id}
                      className='border-border size-4 shrink-0 border'
                    />
                    <span className='text-foreground truncate font-medium'>{post.user.name}</span>
                    <span aria-hidden>·</span>
                    <time dateTime={post.createdAt.toISOString()} className='shrink-0'>
                      {formatPostDate(post.createdAt, { relative: true })}
                    </time>
                  </div>

                  <div className='flex shrink-0 items-center gap-1.5 font-mono text-[11px]'>
                    <div
                      className='border-border/80 bg-background/80 text-muted-foreground group-hover/related:border-foreground/30 inline-flex items-center gap-1 border px-1.5 py-0.5 text-[10px] transition-colors'
                      aria-label={`${post.views.toLocaleString()} views`}
                      title={`${post.views.toLocaleString()} views`}
                    >
                      <EyeIcon
                        className='text-muted-foreground/80 group-hover/related:text-foreground size-2.5 transition-colors'
                        aria-hidden
                      />
                      <span className='text-foreground font-semibold tabular-nums'>
                        {post.views.toLocaleString()}
                      </span>
                    </div>
                    <div
                      className='border-border/80 bg-background/80 text-muted-foreground group-hover/related:border-foreground/30 inline-flex items-center gap-1 border px-1.5 py-0.5 text-[10px] transition-colors'
                      aria-label={`${post.likeCount.toLocaleString()} likes`}
                      title={`${post.likeCount.toLocaleString()} likes`}
                    >
                      <HeartIcon
                        className='text-muted-foreground/80 size-2.5 transition-transform group-hover/related:scale-110 group-hover/related:text-rose-500'
                        aria-hidden
                      />
                      <span className='text-foreground font-semibold tabular-nums'>
                        {post.likeCount.toLocaleString()}
                      </span>
                    </div>
                    <div
                      className='border-border/60 bg-muted/20 text-muted-foreground hidden items-center gap-1 border px-1.5 py-0.5 text-[10px] sm:inline-flex'
                      title={`Estimated read time: ${readTime}`}
                    >
                      <ClockIcon className='text-muted-foreground/70 size-2.5' aria-hidden />
                      <span>{readTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </Frame>
  )
}

export default RelatedPosts
