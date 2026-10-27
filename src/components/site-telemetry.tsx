import { ClockIcon, EyeIcon, HeartIcon, LayersIcon } from 'lucide-react'

import CountUp from '@/components/count-up'
import { Frame, StripHeader } from '@/components/frame'
import { getPosts } from '@/queries/get-posts'
import { cn } from '@/utils'
import { formatPostDate } from '@/utils/format-post-date'

/** Live site telemetry: totals computed from published posts, animated on view. */
const SiteTelemetry = async () => {
  const { posts } = await getPosts()

  const totalViews = posts.reduce((sum, post) => sum + post.views, 0)
  const totalLikes = posts.reduce((sum, post) => sum + post.likeCount, 0)
  const latest = posts[0]?.createdAt ? new Date(posts[0].createdAt) : null

  const stats = [
    {
      icon: LayersIcon,
      label: 'Dispatches',
      value: <CountUp value={posts.length} />,
      note: 'Published articles'
    },
    {
      icon: EyeIcon,
      label: 'Total reads',
      value: <CountUp value={totalViews} />,
      note: 'Views across the archive'
    },
    {
      icon: HeartIcon,
      label: 'Appreciations',
      value: <CountUp value={totalLikes} />,
      note: 'Likes across the archive'
    },
    {
      icon: ClockIcon,
      label: 'Last signal',
      value: latest ? formatPostDate(latest, { relative: true }) : '—',
      note: 'Most recent dispatch'
    }
  ]

  // Border choreography: horizontal rules between stacked rows on mobile/2-col,
  // vertical rules between columns on the 4-col desktop row
  const cellBorders = [
    'border-b border-border sm:border-r lg:border-b-0',
    'border-b border-border lg:border-b-0 lg:border-r',
    'border-b border-border sm:border-r sm:border-b-0',
    'border-b border-border sm:border-b-0'
  ]

  return (
    <Frame aria-label='Site telemetry'>
      <StripHeader
        left={
          <>
            <span className='relative flex size-1.5'>
              <span className='bg-foreground/50 absolute inline-flex h-full w-full animate-ping rounded-full opacity-75' />
              <span className='bg-foreground relative inline-flex size-1.5 rounded-full' />
            </span>
            <span className='text-foreground font-semibold'>Live site telemetry</span>
          </>
        }
        right={<span>Aggregated // all dispatches</span>}
      />

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
        {stats.map((stat, index) => (
          <div key={stat.label} className={cn('p-4 sm:p-5', cellBorders[index])}>
            <div className='text-muted-foreground flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase'>
              <stat.icon className='size-3' aria-hidden />
              <span>{stat.label}</span>
            </div>
            <p className='text-foreground mt-2 truncate font-mono text-2xl font-bold tracking-tight tabular-nums sm:text-3xl'>
              {stat.value}
            </p>
            <p className='text-muted-foreground/60 mt-1 font-mono text-[10px] uppercase'>
              {stat.note}
            </p>
          </div>
        ))}
      </div>
    </Frame>
  )
}

export default SiteTelemetry
