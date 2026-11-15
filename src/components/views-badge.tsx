'use client'

import { Eye } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { CornerBrackets } from '@/components/frame'

const DEFAULT_VIEWS = 577_988

export function ViewsBadge({ className }: { readonly className?: string }) {
  const [displayViews, setDisplayViews] = useState<number>(DEFAULT_VIEWS)
  const [targetViews, setTargetViews] = useState<number>(DEFAULT_VIEWS)
  const displayViewsRef = useRef(displayViews)
  const animFrameRef = useRef<number | null>(null)

  // On client mount, check cached views first
  useEffect(() => {
    try {
      const cached = localStorage.getItem('site_views_cache')
      if (cached) {
        const num = Number.parseInt(cached, 10)
        if (!Number.isNaN(num) && num > 0) {
          setTargetViews(num)
        }
      }
    } catch {
      // Ignore localStorage error
    }
  }, [])

  // Fetch live view count from API
  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const counted = sessionStorage.getItem('views-counted')
        const res = await fetch('/api/views', { method: counted ? 'GET' : 'POST' })
        if (!res.ok) throw new Error(`views API error: ${res.status}`)
        const data = (await res.json()) as { views: number }
        if (!counted) sessionStorage.setItem('views-counted', '1')

        if (!cancelled && typeof data.views === 'number' && data.views > 0) {
          setTargetViews(data.views)
          try {
            localStorage.setItem('site_views_cache', String(data.views))
          } catch {
            // Ignore storage error
          }
        }
      } catch {
        // Keep cached / default views
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  // Smooth Count-Up Animation to targetViews using requestAnimationFrame
  useEffect(() => {
    const reducedMotion = globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reducedMotion) {
      displayViewsRef.current = targetViews
      setDisplayViews(targetViews)
      return
    }

    const startVal = displayViewsRef.current
    const endVal = targetViews
    if (startVal === endVal) return

    const durationMs = 1000
    const startTime = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(1, elapsed / durationMs)
      // Ease-out cubic curve
      const ease = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(startVal + (endVal - startVal) * ease)

      displayViewsRef.current = current
      setDisplayViews(current)

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(tick)
      }
    }

    animFrameRef.current = requestAnimationFrame(tick)

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [targetViews])

  return (
    <div
      className={`text-muted-foreground relative inline-flex items-center gap-1.5 px-2 py-1 text-sm ${className ?? ''}`}
      title='Total reads across the site'
    >
      <CornerBrackets />
      <Eye className='text-foreground/80 size-4 shrink-0' />
      <span
        suppressHydrationWarning
        className='text-foreground font-mono text-xs font-semibold tracking-tight tabular-nums'
      >
        {displayViews.toLocaleString('en-US')}
      </span>
    </div>
  )
}

export default ViewsBadge
