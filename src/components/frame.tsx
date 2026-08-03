import { cn } from '@/lib/utils'
import type { HTMLAttributes, ReactNode } from 'react'

function Corners() {
  return (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute -top-px -left-px z-10 size-2.5 border-t-2 border-l-2 border-foreground/45 sm:size-3"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -top-px -right-px z-10 size-2.5 border-t-2 border-r-2 border-foreground/45 sm:size-3"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-px -left-px z-10 size-2.5 border-b-2 border-l-2 border-foreground/45 sm:size-3"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -right-px -bottom-px z-10 size-2.5 border-b-2 border-r-2 border-foreground/45 sm:size-3"
      />
    </>
  )
}

type FrameProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  corners?: boolean
  as?: 'div' | 'section' | 'article' | 'aside' | 'header' | 'footer'
}

/** Blueprint-style content box with corner L-brackets */
export function Frame({
  children,
  className,
  corners = true,
  as: Comp = 'div',
  ...props
}: FrameProps) {
  return (
    <Comp
      className={cn(
        'relative border border-border bg-card/80 backdrop-blur-[1px]',
        className
      )}
      {...props}
    >
      {corners && <Corners />}
      {children}
    </Comp>
  )
}

type FrameHeaderProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode
  label?: string
}

export function FrameHeader({
  children,
  label,
  className,
  ...props
}: FrameHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 border-b border-border px-4 py-3 sm:px-5',
        className
      )}
      {...props}
    >
      {label && (
        <span className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          {label}
        </span>
      )}
      {children}
    </div>
  )
}

export function FrameBody({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-4 py-5 sm:px-5 sm:py-6', className)} {...props}>
      {children}
    </div>
  )
}

export function FrameDivider({ className }: { className?: string }) {
  return <div className={cn('h-px w-full bg-border', className)} />
}

/** 2×2 blueprint grid with outer corners + center crosshair */
export function FrameGrid({
  children,
  className
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('relative grid sm:grid-cols-2', className)}>
      <span
        aria-hidden
        className="pointer-events-none absolute -top-px -left-px z-20 size-3 border-t-2 border-l-2 border-foreground/45"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -top-px -right-px z-20 size-3 border-t-2 border-r-2 border-foreground/45"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-px -left-px z-20 size-3 border-b-2 border-l-2 border-foreground/45"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -right-px -bottom-px z-20 size-3 border-b-2 border-r-2 border-foreground/45"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 z-20 hidden size-3 -translate-x-1/2 -translate-y-1/2 sm:block"
      >
        <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-foreground/45" />
        <span className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-foreground/45" />
      </span>
      {children}
    </div>
  )
}

export function FrameGridCell({
  children,
  className,
  label
}: {
  children: ReactNode
  className?: string
  label?: string
}) {
  return (
    <div
      className={cn(
        'border-border bg-card/80 p-4 sm:border-r sm:border-b sm:p-5',
        'border-b last:border-b-0 sm:odd:border-r sm:[&:nth-last-child(-n+2)]:border-b-0',
        className
      )}
    >
      {label && (
        <p className="mb-3 text-sm font-semibold tracking-tight">{label}</p>
      )}
      {children}
    </div>
  )
}
