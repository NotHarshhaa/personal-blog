import { ClockIcon, EyeIcon, HeartIcon } from 'lucide-react'
import Link from 'next/link'
import readingTime from 'reading-time'

import { Frame, FrameHeader } from '@/components/frame'
import UserAvatar from '@/components/user-avatar'
import { getPosts } from '@/queries/get-posts'
import { formatPostDate } from '@/utils/format-post-date'

type RelatedPostsProps = {
  currentPostId: string
  currentPostTitle: string
  currentPostDescription?: string | null
}

const RelatedPosts = async ({
  currentPostId,
  currentPostTitle,
  currentPostDescription
}: RelatedPostsProps) => {
  const { posts } = await getPosts()

  const relatedPosts = posts
    .filter((post) => post.id !== currentPostId)
    .map((post) => {
      const titleWords = currentPostTitle.toLowerCase().split(/\s+/)
      const postTitleWords = post.title.toLowerCase().split(/\s+/)
      const commonTitleWords = titleWords.filter((word) =>
        postTitleWords.includes(word)
      ).length

      const description = currentPostDescription?.toLowerCase() ?? ''
      const postDescription = post.description?.toLowerCase() ?? ''

      let descriptionMatch = 0
      if (description && postDescription) {
        descriptionMatch = postDescription.includes(description.slice(0, 20))
          ? 2
          : 0
      }

      return {
        post: {
          ...post,
          createdAt: new Date(post.createdAt)
        },
        score: commonTitleWords + descriptionMatch
      }
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.post)

  if (relatedPosts.length === 0) return null

  return (
    <Frame>
      <FrameHeader label="Related posts" />
      <div className="divide-y divide-border">
        {relatedPosts.map((post, index) => {
          const readTime = readingTime(post.description ?? post.title).text

          return (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              data-hover-label="Read"
              className="hover-hatch group/related flex items-center gap-3.5 p-4 transition-colors sm:gap-4 sm:p-5"
            >
              {/* Compact technical preview banner */}
              <div className="flex aspect-[16/9] w-24 shrink-0 flex-col justify-between overflow-hidden border border-border/80 bg-muted/40 p-1.5 font-mono text-[8px] tracking-widest text-muted-foreground uppercase transition-colors group-hover/related:bg-muted/70 sm:w-36 sm:p-2">
                <span className="flex items-center justify-between gap-1">
                  <span>DOC</span>
                  <span className="truncate">{post.id.slice(0, 6)}</span>
                </span>
                <span
                  className="text-center text-foreground/50"
                  aria-hidden
                >
                  :::
                </span>
                <span className="flex items-center justify-between gap-1 text-muted-foreground/70">
                  <span>REF</span>
                  <span>[{String(index + 1).padStart(2, '0')}]</span>
                </span>
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <h3 className="font-heading text-sm font-medium tracking-tight text-foreground transition-colors group-hover/related:underline sm:text-base">
                  {post.title}
                </h3>
                {post.description && (
                  <p className="mt-1 line-clamp-1 text-xs leading-relaxed text-muted-foreground">
                    {post.description}
                  </p>
                )}

                <div className="mt-2 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                    <UserAvatar
                      width={16}
                      height={16}
                      src={post.user.image}
                      alt={post.user.name}
                      userId={post.user.id}
                      className="size-4 shrink-0 border border-border"
                    />
                    <span className="truncate text-foreground font-medium">
                      {post.user.name}
                    </span>
                    <span aria-hidden>·</span>
                    <time
                      dateTime={post.createdAt.toISOString()}
                      className="shrink-0"
                    >
                      {formatPostDate(post.createdAt, { relative: true })}
                    </time>
                  </div>

                  <div className="flex shrink-0 items-center gap-3 font-mono text-[11px] text-muted-foreground">
                    <span
                      className="inline-flex items-center gap-1"
                      aria-label={`${post.views.toLocaleString()} views`}
                    >
                      <EyeIcon className="size-3" aria-hidden />
                      <span className="hidden sm:inline">
                        {post.views.toLocaleString()}
                      </span>
                    </span>
                    <span
                      className="inline-flex items-center gap-1"
                      aria-label={`${post.likeCount.toLocaleString()} likes`}
                    >
                      <HeartIcon className="size-3" aria-hidden />
                      <span className="hidden sm:inline">
                        {post.likeCount.toLocaleString()}
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <ClockIcon className="size-3" aria-hidden />
                      <span className="hidden sm:inline">{readTime}</span>
                    </span>
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
