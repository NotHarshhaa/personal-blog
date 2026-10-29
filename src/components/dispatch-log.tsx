import { ArrowDownIcon, GitBranchIcon, TagIcon } from 'lucide-react'
import Link from 'next/link'

import { Frame, FrameDivider, StripHeader } from '@/components/frame'
import { HoverMark } from '@/components/hover-mark'
import { getPosts } from '@/queries/get-posts'
import { formatPostDate } from '@/utils/format-post-date'

const FNV_OFFSET = 2_166_136_261
const FNV_PRIME = 16_777_619

/** Deterministic 7-char faux SHA-1 derived from the post id (FNV-1a, same family as engagement seeds) */
const toCommitSha = (id: string) => {
  let hash = FNV_OFFSET

  for (let i = 0; i < id.length; i++) {
    hash ^= id.codePointAt(i) ?? 0
    hash = Math.imul(hash, FNV_PRIME)
  }

  return (hash >>> 0).toString(16).padStart(8, '0').slice(0, 7)
}

const COMMITS_SHOWN = 7

/** Recent dispatches rendered as a git commit graph — `git log --oneline` for the archive. */
const DispatchLog = async () => {
  const { posts } = await getPosts()

  if (posts.length === 0) return null

  const commits = posts.slice(0, COMMITS_SHOWN)

  return (
    <Frame as='section' aria-label='Dispatch log — recent commits'>
      <StripHeader
        left={
          <>
            <GitBranchIcon className='text-foreground size-3' aria-hidden />
            <span className='text-foreground font-semibold'>Dispatch log // git log --oneline</span>
          </>
        }
        right={
          <>
            <span className='hidden sm:inline'>origin/main</span>
            <span>{posts.length} commits</span>
          </>
        }
      />

      <ol className='py-1'>
        {commits.map((post, index) => {
          const sha = toCommitSha(post.id)
          const isHead = index === 0
          const isFirst = index === 0
          const isLast = index === commits.length - 1

          return (
            <li key={post.id}>
              <HoverMark label='Read dispatch'>
                <Link
                  href={`/posts/${post.id}`}
                  className='group/row flex items-stretch gap-3 px-4 py-3 sm:gap-4 sm:px-5'
                >
                  {/* Commit graph rail */}
                  <span aria-hidden className='relative flex w-3 shrink-0 justify-center sm:w-4'>
                    {!isLast && (
                      <span
                        className={`bg-border absolute left-1/2 w-px -translate-x-1/2 ${isFirst ? 'top-4' : 'top-0'} bottom-0`}
                      />
                    )}
                    {isLast && (
                      <span className='bg-border absolute top-0 bottom-4 left-1/2 w-px -translate-x-1/2' />
                    )}
                    <span className='border-border bg-card group-hover/mark:border-foreground group-hover/mark:bg-foreground relative z-10 mt-3 size-2 self-start border transition-colors' />
                  </span>

                  <div className='min-w-0 flex-1 space-y-1'>
                    {/* Mono meta line: sha + ref + date */}
                    <div className='text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[10px] tracking-wider'>
                      <span className='text-muted-foreground/70 tabular-nums'>{sha}</span>
                      {isHead && (
                        <span className='border-foreground/40 bg-foreground/5 text-foreground border px-1 py-px font-semibold'>
                          HEAD → main
                        </span>
                      )}
                      <time dateTime={post.createdAt.toISOString()}>
                        {formatPostDate(post.createdAt, { relative: true })}
                      </time>
                    </div>

                    <h3 className='font-heading text-foreground text-sm leading-snug font-semibold tracking-tight transition-colors group-hover/mark:underline sm:text-base'>
                      {post.title}
                    </h3>

                    <div className='flex flex-wrap items-center gap-1.5'>
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className='border-border/60 bg-background/80 text-muted-foreground inline-flex items-center gap-0.5 border px-1.5 py-0.5 font-mono text-[9px] tracking-wider uppercase'
                        >
                          <TagIcon className='size-2.5' aria-hidden />
                          {tag}
                        </span>
                      ))}
                      <span className='text-muted-foreground/60 ml-auto font-mono text-[10px] tabular-nums'>
                        {post.views.toLocaleString()} views
                      </span>
                    </div>
                  </div>
                </Link>
              </HoverMark>
            </li>
          )
        })}
      </ol>

      <FrameDivider />

      <Link
        href='/#archive'
        className='text-muted-foreground hover:bg-foreground hover:text-background flex items-center justify-between gap-2 px-4 py-2.5 font-mono text-[11px] tracking-widest uppercase transition-colors sm:px-5'
      >
        <span>full log ↓ {posts.length} commits total</span>
        <ArrowDownIcon className='size-3' aria-hidden />
      </Link>
    </Frame>
  )
}

export default DispatchLog
