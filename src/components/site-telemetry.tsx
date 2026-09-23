import CountUp from '@/components/count-up'
import { Frame, FrameGrid, FrameGridCell, FrameHeader } from '@/components/frame'
import { getPosts } from '@/queries/get-posts'
import { formatPostDate } from '@/utils/format-post-date'

/** Live site telemetry: totals computed from published posts, animated on view. */
const SiteTelemetry = async () => {
  const { posts } = await getPosts()

  const totalViews = posts.reduce((sum, post) => sum + post.views, 0)
  const totalLikes = posts.reduce((sum, post) => sum + post.likeCount, 0)
  const latest = posts[0]?.createdAt ? new Date(posts[0].createdAt) : null

  return (
    <Frame aria-label="Site telemetry">
      <FrameHeader label="LIVE SITE TELEMETRY">
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground uppercase">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground/50 opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-foreground" />
          </span>
          AGGREGATED // ALL DISPATCHES
        </span>
      </FrameHeader>

      <FrameGrid className="border-t-0">
        <FrameGridCell className="border-b border-border p-4 sm:border-r sm:border-b sm:p-5">
          <p className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
            Dispatches
          </p>
          <p className="mt-1 font-mono text-2xl font-bold tracking-tight text-foreground tabular-nums sm:text-3xl">
            <CountUp value={posts.length} />
          </p>
          <p className="mt-1 font-mono text-[10px] text-muted-foreground/60 uppercase">
            Published articles
          </p>
        </FrameGridCell>

        <FrameGridCell className="border-b border-border p-4 sm:border-b sm:p-5">
          <p className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
            Total reads
          </p>
          <p className="mt-1 font-mono text-2xl font-bold tracking-tight text-foreground tabular-nums sm:text-3xl">
            <CountUp value={totalViews} />
          </p>
          <p className="mt-1 font-mono text-[10px] text-muted-foreground/60 uppercase">
            Views across the archive
          </p>
        </FrameGridCell>

        <FrameGridCell className="border-b border-border p-4 sm:border-r sm:border-b-0 sm:p-5">
          <p className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
            Appreciations
          </p>
          <p className="mt-1 font-mono text-2xl font-bold tracking-tight text-foreground tabular-nums sm:text-3xl">
            <CountUp value={totalLikes} />
          </p>
          <p className="mt-1 font-mono text-[10px] text-muted-foreground/60 uppercase">
            Likes across the archive
          </p>
        </FrameGridCell>

        <FrameGridCell className="border-b border-border sm:border-b-0 p-4 sm:p-5">
          <p className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
            Last signal
          </p>
          <p className="mt-1 truncate font-mono text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {latest ? formatPostDate(latest, { relative: true }) : '—'}
          </p>
          <p className="mt-1 font-mono text-[10px] text-muted-foreground/60 uppercase">
            Most recent dispatch
          </p>
        </FrameGridCell>
      </FrameGrid>
    </Frame>
  )
}

export default SiteTelemetry
