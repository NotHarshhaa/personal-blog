'use client'

import { ExternalLink, GitCommit } from 'lucide-react'
import { useMemo } from 'react'

import { Frame, FrameHeader } from '@/components/frame'
import { useGithubHeatmap } from '@/hooks/use-github-heatmap'
import { cn } from '@/utils'

const HEAT_OPACITY = [0.08, 0.28, 0.52, 0.78, 1]
const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
]

type GithubActivityProps = {
  username?: string
  className?: string
}

export const GithubActivity = ({
  username = 'NotHarshhaa',
  className
}: GithubActivityProps) => {
  const heatmap = useGithubHeatmap(username)

  const monthLabels = useMemo(() => {
    const now = new Date()
    return Array.from(
      { length: 12 },
      (_, i) => MONTH_NAMES[(now.getMonth() + 1 + i) % 12]
    )
  }, [])

  return (
    <Frame aria-label="GitHub commit activity" className={cn('w-full', className)}>
      <FrameHeader label="OPEN SOURCE // GITHUB ACTIVITY">
        <div className="flex items-center gap-3 font-mono text-[10px] text-muted-foreground uppercase">
          <a
            href={`https://github.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-foreground hover:underline transition-colors"
          >
            <span>@{username}</span>
            <ExternalLink className="size-3" />
          </a>
        </div>
      </FrameHeader>

      <div className="p-4 sm:p-5">
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[680px]">
            {/* Month labels at the top */}
            <div className="mb-2 flex justify-between pr-4 font-mono text-[10px] text-muted-foreground/75 uppercase tracking-wider">
              {monthLabels.map((m, i) => (
                <span key={`${m}-${i}`}>{m}</span>
              ))}
            </div>

            {/* Heatmap Grid */}
            <div className="grid grid-flow-col grid-rows-7 gap-[3.5px]">
              {heatmap.cells.map((level, i) =>
                level === null ? (
                  <span key={i} className="size-[10px]" />
                ) : (
                  <span
                    key={i}
                    className="size-[10px] border border-border/40 bg-foreground transition-transform duration-150 hover:scale-125 hover:z-10 cursor-pointer"
                    style={{ opacity: HEAT_OPACITY[level] }}
                    title={`Activity level: ${level}`}
                  />
                )
              )}
            </div>

            {/* Info and stats at the bottom */}
            <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-2.5 font-mono text-[11px] text-muted-foreground">
              <span className="flex items-center gap-2">
                <GitCommit className="size-3.5 text-foreground" />
                <span>
                  {heatmap.live
                    ? `${heatmap.total.toLocaleString()} contributions in the last year`
                    : '650+ contributions in the last year'}
                </span>
                <span className="text-[10px] text-muted-foreground/50">
                  {heatmap.live ? '[LIVE SYNC]' : '[TELEMETRY CACHE]'}
                </span>
              </span>

              {/* Legend */}
              <div className="flex items-center gap-1.5 text-[10px] uppercase">
                <span>Less</span>
                {HEAT_OPACITY.map((opacity, idx) => (
                  <span
                    key={idx}
                    className="size-[9px] border border-border/50 bg-foreground"
                    style={{ opacity }}
                  />
                ))}
                <span>More</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Frame>
  )
}

export default GithubActivity
