'use client'

import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/utils'

type CornerBracketsProps = {
  className?: string
  visible?: boolean
}

export function CornerBrackets({ className, visible = true }: Readonly<CornerBracketsProps>) {
  const visibility = visible ? 'opacity-100' : 'opacity-0'
  const sharedClassName = cn(
    'border-muted-foreground/50 pointer-events-none absolute size-2 transition-opacity',
    visibility,
    className
  )

  return (
    <>
      <span
        aria-hidden
        className={cn(sharedClassName, '-top-px -left-px z-20 border-t border-l')}
      />
      <span
        aria-hidden
        className={cn(sharedClassName, '-top-px -right-px z-20 border-t border-r')}
      />
      <span
        aria-hidden
        className={cn(sharedClassName, '-bottom-px -left-px z-20 border-b border-l')}
      />
      <span
        aria-hidden
        className={cn(sharedClassName, '-right-px -bottom-px z-20 border-r border-b')}
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
}: Readonly<FrameProps>) {
  return (
    <Comp className={cn('border-border bg-card relative border', className)} {...props}>
      {corners && <CornerBrackets />}
      {children}
    </Comp>
  )
}

type FrameHeaderProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode
  label?: string
}

export function FrameHeader({ children, label, className, ...props }: Readonly<FrameHeaderProps>) {
  return (
    <div
      className={cn(
        'border-border flex items-center justify-between gap-4 border-b px-4 py-3 sm:px-5',
        className
      )}
      {...props}
    >
      {label && (
        <span className='bracket-title font-heading text-foreground px-1.5 py-0.5 text-xl font-medium tracking-tight sm:text-2xl md:text-3xl'>
          {label.endsWith('.') ? label : `${label}.`}
        </span>
      )}
      {children}
    </div>
  )
}

type StripHeaderProps = {
  left?: ReactNode
  right?: ReactNode
  className?: string
}

/**
 * Compact blueprint status strip: a 9px mono row over a faint grid pattern.
 * The site-wide section header language (cards, article header, footer, TOC).
 */
export function StripHeader({ left, right, className }: Readonly<StripHeaderProps>) {
  return (
    <div
      className={cn('border-border/80 bg-muted/30 relative overflow-hidden border-b', className)}
    >
      <div
        aria-hidden
        className='absolute inset-0 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_80%)] [background-size:14px_14px] opacity-50'
      />
      <div className='text-muted-foreground relative flex items-center justify-between gap-2 px-4 py-2 font-mono text-[9px] tracking-widest uppercase sm:px-5'>
        <div className='flex min-w-0 items-center gap-2'>{left}</div>
        <div className='flex shrink-0 items-center gap-2'>{right}</div>
      </div>
    </div>
  )
}

export function FrameBody({
  children,
  className,
  ...props
}: Readonly<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className={cn('px-4 py-5 sm:px-5 sm:py-6', className)} {...props}>
      {children}
    </div>
  )
}

export function FrameDivider({ className }: Readonly<{ className?: string }>) {
  return <div className={cn('bg-border h-px w-full', className)} />
}

/** 2×2 blueprint grid with outer corners + center crosshair */
export function FrameGrid({
  children,
  className
}: Readonly<{
  children: ReactNode
  className?: string
}>) {
  return (
    <div className={cn('relative grid sm:grid-cols-2', className)}>
      <span
        aria-hidden
        className='border-muted-foreground/50 pointer-events-none absolute -top-px -left-px z-20 size-2 border-t border-l'
      />
      <span
        aria-hidden
        className='border-muted-foreground/50 pointer-events-none absolute -top-px -right-px z-20 size-2 border-t border-r'
      />
      <span
        aria-hidden
        className='border-muted-foreground/50 pointer-events-none absolute -bottom-px -left-px z-20 size-2 border-b border-l'
      />
      <span
        aria-hidden
        className='border-muted-foreground/50 pointer-events-none absolute -right-px -bottom-px z-20 size-2 border-r border-b'
      />
      <span
        aria-hidden
        className='pointer-events-none absolute top-1/2 left-1/2 z-20 hidden size-3 -translate-x-1/2 -translate-y-1/2 sm:block'
      >
        <span className='bg-muted-foreground/50 absolute top-1/2 left-0 h-px w-full -translate-y-1/2' />
        <span className='bg-muted-foreground/50 absolute top-0 left-1/2 h-full w-px -translate-x-1/2' />
      </span>
      {children}
    </div>
  )
}

export function FrameGridCell({
  children,
  className,
  label
}: Readonly<{
  children: ReactNode
  className?: string
  label?: string
}>) {
  return (
    <div
      className={cn(
        'border-border bg-card/80 p-4 sm:border-r sm:border-b sm:p-5',
        'border-b last:border-b-0 sm:odd:border-r sm:[&:nth-last-child(-n+2)]:border-b-0',
        className
      )}
    >
      {label && <p className='mb-3 text-sm font-semibold tracking-tight'>{label}</p>}
      {children}
    </div>
  )
}
