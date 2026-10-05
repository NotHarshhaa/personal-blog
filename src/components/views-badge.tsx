'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Eye } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { CornerBrackets } from '@/components/frame'

// ── Animated counter ported from the reference portfolio ────────────────────

function FlipDigit({ digit, index }: { readonly digit: string; readonly index: number }) {
  return (
    <span className='relative inline-flex h-[1.2em] overflow-hidden'>
      <AnimatePresence mode='popLayout' initial={false}>
        <motion.span
          key={digit}
          initial={{ y: '100%', opacity: 0, filter: 'blur(4px)' }}
          animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: '-100%', opacity: 0, filter: 'blur(4px)' }}
          transition={{
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
            delay: index * 0.04
          }}
          className='inline-block'
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

function AnimatedNumber({ value }: { readonly value: number }) {
  const [displayed, setDisplayed] = useState(0)
  const previousRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const from = previousRef.current
    previousRef.current = value

    if (from === value) return

    const duration = 1200
    const steps = 30
    let step = 0

    const tick = () => {
      step++
      const current = step === steps ? value : Math.floor(from + ((value - from) * step) / steps)
      setDisplayed(current)
      if (step < steps) {
        timerRef.current = setTimeout(tick, duration / steps)
      }
    }

    timerRef.current = setTimeout(tick, 300) // slight initial delay

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [value])

  const digits = displayed.toLocaleString('en').split('')

  return (
    <span className='inline-flex tabular-nums'>
      {digits.map((char, i) => (
        <FlipDigit key={`${i}-${char}`} digit={char} index={i} />
      ))}
    </span>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────────────

export function ViewsBadge({ className }: { readonly className?: string }) {
  const [views, setViews] = useState<number | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        // Count one visit per browser session so refreshes don't inflate it
        const counted = sessionStorage.getItem('views-counted')
        const res = await fetch('/api/views', { method: counted ? 'GET' : 'POST' })
        if (!res.ok) throw new Error(`views API error: ${res.status}`)
        const data = (await res.json()) as { views: number }
        if (!counted) sessionStorage.setItem('views-counted', '1')
        if (!cancelled) {
          setFailed(false)
          setViews(data.views)
        }
      } catch {
        if (!cancelled) setFailed(true)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div
      className={`text-muted-foreground relative inline-flex items-center gap-1.5 px-2 py-1 text-sm ${className ?? ''}`}
      title='Total reads across the site'
    >
      <CornerBrackets />
      <Eye className='size-4' />
      {views === null ? (
        <span
          className={`tabular-nums ${failed ? 'opacity-40' : 'opacity-30'}`}
          aria-label={failed ? 'Views unavailable' : 'Loading view count'}
        >
          {failed ? '—' : '0000'}
        </span>
      ) : (
        <AnimatedNumber value={views} />
      )}
    </div>
  )
}
