'use client'

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  LayersIcon
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { CornerBrackets } from '@/components/frame'
import { cn } from '@/utils'

type SeriesPostItem = {
  id: string
  title: string
  seriesOrder: number
}

type SeriesNavigatorProps = {
  series: {
    id: string
    title: string
    slug: string
    description?: string | null
    posts: SeriesPostItem[]
  }
  currentPostId: string
  currentOrder: number
}

export const SeriesNavigator = ({
  series,
  currentPostId,
  currentOrder
}: SeriesNavigatorProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const sortedPosts = [...series.posts].sort(
    (a, b) => a.seriesOrder - b.seriesOrder
  )
  const currentIndex = sortedPosts.findIndex((p) => p.id === currentPostId)
  const prevPost = currentIndex > 0 ? sortedPosts[currentIndex - 1] : null
  const nextPost =
    currentIndex >= 0 && currentIndex < sortedPosts.length - 1
      ? sortedPosts[currentIndex + 1]
      : null

  const total = sortedPosts.length

  return (
    <div className="relative border border-border bg-card">
      <CornerBrackets />

      {/* Series Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/40 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-6 items-center justify-center border border-border bg-background">
            <LayersIcon className="size-3.5 text-foreground" />
          </div>
          <div className="leading-tight">
            <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
              Part of Track
            </p>
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              {series.title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="border border-border bg-background px-2 py-0.5 font-mono text-[11px] font-medium text-foreground">
            PART {currentOrder} OF {total}
          </span>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center gap-1 border border-border bg-background px-2.5 py-1 font-mono text-[11px] uppercase transition-colors hover:border-foreground hover:text-foreground cursor-pointer"
            aria-expanded={isOpen}
            aria-label="Toggle series overview"
          >
            <span>Outline</span>
            <ChevronDownIcon
              className={cn(
                'size-3.5 transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
            />
          </button>
        </div>
      </div>

      {/* Expandable Series Track Outline */}
      {isOpen && (
        <div className="border-b border-border bg-muted/10 p-3 sm:p-4">
          <p className="mb-2.5 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
            Track Roadmap ({total} Steps)
          </p>
          <ul className="space-y-1.5">
            {sortedPosts.map((post, idx) => {
              const isCurrent = post.id === currentPostId
              const isPast = idx < currentIndex

              return (
                <li key={post.id}>
                  <Link
                    href={`/posts/${post.id}`}
                    className={cn(
                      'flex items-center justify-between gap-3 border p-2 text-xs transition-colors',
                      isCurrent
                        ? 'border-foreground bg-foreground text-background font-medium'
                        : 'border-border/70 bg-background hover:border-foreground hover:text-foreground'
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={cn(
                          'font-mono text-[10px]',
                          isCurrent
                            ? 'text-background/80'
                            : 'text-muted-foreground'
                        )}
                      >
                        0{idx + 1}.
                      </span>
                      <span className="truncate">{post.title}</span>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      {isCurrent && (
                        <span className="font-mono text-[10px] uppercase tracking-wider text-background">
                          Current
                        </span>
                      )}
                      {!isCurrent && isPast && (
                        <CheckCircle2Icon className="size-3.5 text-foreground" />
                      )}
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Quick Prev / Next Navigation Footer */}
      <div className="flex flex-col items-stretch justify-between gap-2 p-3 sm:flex-row sm:items-center sm:px-5">
        {prevPost ? (
          <Link
            href={`/posts/${prevPost.id}`}
            className="group inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span className="font-mono text-[10px] uppercase">
              Prev: {prevPost.title}
            </span>
          </Link>
        ) : (
          <span className="font-mono text-[10px] text-muted-foreground/40 uppercase">
            First step in track
          </span>
        )}

        {nextPost ? (
          <Link
            href={`/posts/${nextPost.id}`}
            className="group inline-flex items-center gap-2 text-right text-xs text-muted-foreground transition-colors hover:text-foreground sm:ml-auto"
          >
            <span className="font-mono text-[10px] uppercase">
              Next: {nextPost.title}
            </span>
            <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        ) : (
          <span className="font-mono text-[10px] text-muted-foreground/40 uppercase sm:ml-auto">
            Completed track
          </span>
        )}
      </div>
    </div>
  )
}

export default SeriesNavigator
