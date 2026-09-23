'use client'

import { ArrowUp } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui'

const STROKE = 2 * Math.PI * 18

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(0)
  const isVisibleRef = useRef(false)

  useEffect(() => {
    let ticking = false

    const update = () => {
      const next = window.scrollY > 400
      if (next !== isVisibleRef.current) {
        isVisibleRef.current = next
        setIsVisible(next)
      }
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0)
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(update)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    update()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!isVisible) return null

  return (
    <Button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      size="icon"
      variant="outline"
      className="fixed right-4 bottom-24 z-40 size-10 border-border bg-card sm:right-6 sm:bottom-6"
      aria-label={`Scroll to top (${Math.round(progress * 100)}% read)`}
      title={`${Math.round(progress * 100)}% read`}
    >
      <ArrowUp className="size-4" />
      <svg
        aria-hidden
        viewBox="0 0 40 40"
        className="pointer-events-none absolute inset-0 size-full"
      >
        <circle
          cx="20"
          cy="20"
          r="18"
          fill="none"
          stroke="var(--foreground)"
          strokeWidth="2"
          strokeDasharray={STROKE}
          strokeDashoffset={STROKE * (1 - progress)}
          transform="rotate(-90 20 20)"
        />
      </svg>
    </Button>
  )
}

export default ScrollToTop
