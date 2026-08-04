'use client'

import { useEffect, useRef } from 'react'

const ReadingProgress = () => {
  const barRef = useRef<HTMLDivElement>(null)
  const visibleRef = useRef(false)

  useEffect(() => {
    const bar = barRef.current
    const track = bar?.parentElement
    if (!bar || !track) return

    let ticking = false

    const updateProgress = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight - windowHeight
      const progress =
        documentHeight > 0
          ? Math.min((window.scrollY / documentHeight) * 100, 100)
          : 0

      bar.style.transform = `scaleX(${progress / 100})`

      const shouldShow = progress > 0
      if (shouldShow !== visibleRef.current) {
        visibleRef.current = shouldShow
        track.style.opacity = shouldShow ? '1' : '0'
      }

      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(updateProgress)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    updateProgress()

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 bg-transparent opacity-0"
      aria-hidden
    >
      <div
        ref={barRef}
        className="h-full origin-left bg-foreground will-change-transform"
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  )
}

export default ReadingProgress
