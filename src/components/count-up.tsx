'use client'

import { useEffect, useRef, useState } from 'react'

type CountUpProps = {
  value: number
  durationMs?: number
}

/** Animates from 0 to `value` the first time it scrolls into view. */
const CountUp = ({ value, durationMs = 1200 }: CountUpProps) => {
  const [display, setDisplay] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const startedRef = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reducedMotion = globalThis.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    if (reducedMotion) {
      setDisplay(value)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting) || startedRef.current) {
          return
        }
        startedRef.current = true
        observer.disconnect()

        const start = performance.now()
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / durationMs)
          const eased = 1 - Math.pow(1 - t, 3)
          setDisplay(Math.round(value * eased))
          if (t < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [value, durationMs])

  return <span ref={ref}>{display.toLocaleString()}</span>
}

export default CountUp
