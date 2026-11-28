'use client'

import Link from 'next/link'

export const TopTicker = () => {
  return (
    <aside
      aria-label='Announcement'
      className='border-border bg-card/95 relative z-40 w-full overflow-hidden border-b py-1.5 font-mono text-[11px] tracking-wide backdrop-blur-xs select-none'
    >
      <div className='mx-auto flex w-full max-w-[90rem] items-center justify-between px-4 sm:px-6 lg:px-8'>
        <div className='text-muted-foreground flex min-w-0 items-center gap-2 overflow-hidden'>
          <span className='text-foreground inline-flex shrink-0 items-center gap-1.5 font-bold tracking-wider whitespace-nowrap uppercase'>
            <span className='bg-success size-1.5 animate-pulse rounded-full' />
            DISPATCH // 2026
          </span>
          <span className='text-border hidden sm:inline'>|</span>
          <span className='min-w-0 truncate'>
            Kubernetes v1.32 & Terraform GitOps Hardening Guide is live.
          </span>
          <Link
            href='/posts'
            className='text-foreground inline-flex shrink-0 items-center gap-0.5 font-medium whitespace-nowrap underline underline-offset-3 hover:opacity-80'
          >
            Read notes <span aria-hidden>↗</span>
          </Link>
        </div>

        <div className='text-muted-foreground hidden shrink-0 items-center gap-4 text-[10px] uppercase md:flex'>
          <span>SYS.SEC: VERIFIED</span>
          <span className='text-border'>|</span>
          <span>LATENCY: &lt;14MS</span>
        </div>
      </div>
    </aside>
  )
}

export default TopTicker
