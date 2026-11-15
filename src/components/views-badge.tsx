'use client'

import { Eye } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { CornerBrackets } from '@/components/frame'

export function ViewsBadge({ className }: { readonly className?: string }) {
  const [displayViews, setDisplayViews] = useState<number | null>(null)
  const [targetViews, setTargetViews] = useState<number | null>(null)
  const displayViewsRef = useRef(displayViews)
  const animFrameRef = useRef<number | null>(null)

  // On client mount, check cached views first
  useEffect(() => {
    try {
      const cached = localStorage.getItem('site_views_cache')
      if (cached) {
        const num = Number.parseInt(cached, 10)
        if (Number.isSafeInteger(num) && num >= 0) {
          displayViewsRef.current = num
          setDisplayViews(num)
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
        let counted = false
        try {
          counted = sessionStorage.getItem('views-counted') === '1'
        } catch {
          // Keep loading the live count when browser storage is disabled.
        }

        const res = await fetch('/api/views', {
          method: counted ? 'GET' : 'POST',
          cache: 'no-store'
        })
        if (!res.ok) throw new Error(`views API error: ${res.status}`)
        const data = (await res.json()) as { views: number }
        if (!counted) {
          try {
            sessionStorage.setItem('views-counted', '1')
          } catch {
            // Storage can be disabled; the live count is still usable.
          }
        }

        if (!cancelled && Number.isSafeInteger(data.views) && data.views >= 0) {
          setTargetViews(data.views)
          if (displayViewsRef.current === null) {
            displayViewsRef.current = data.views
            setDisplayViews(data.views)
          }
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
    if (targetViews === null) return

    const reducedMotion = globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reducedMotion) {
      displayViewsRef.current = targetViews
      setDisplayViews(targetViews)
      return
    }

    const startVal = displayViewsRef.current ?? targetViews
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
        {displayViews?.toLocaleString('en-US') ?? '—'}
      </span>
    </div>
  )
}

export default ViewsBadge
