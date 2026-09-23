'use client'

import Link from 'next/link'

export const TopTicker = () => {
  return (
    <aside
      aria-label="Announcement"
      className="relative z-40 w-full overflow-hidden border-b border-border bg-card/90 py-1.5 font-mono text-[11px] tracking-wide backdrop-blur-xs select-none"
    >
      <div className="flex w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-hidden text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-foreground">
            <span className="size-1.5 animate-pulse rounded-full bg-foreground" />
            DISPATCH // 2026
          </span>
          <span className="hidden text-border sm:inline">|</span>
          <span className="truncate">
            Kubernetes v1.32 & Terraform GitOps Hardening Guide is live.
          </span>
          <Link
            href="/posts"
            className="inline-flex items-center gap-0.5 font-medium text-foreground underline underline-offset-3 hover:opacity-80"
          >
            Read notes <span aria-hidden>↗</span>
          </Link>
        </div>

        <div className="hidden shrink-0 items-center gap-4 text-[10px] text-muted-foreground uppercase md:flex">
          <span>SYS.SEC: VERIFIED</span>
          <span className="text-border">|</span>
          <span>LATENCY: &lt;14MS</span>
        </div>
      </div>
    </aside>
  )
}

export default TopTicker
