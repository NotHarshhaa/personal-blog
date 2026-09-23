'use client'

import { useEffect, useState } from 'react'

export const HudFooter = () => {
  const [mounted, setMounted] = useState(false)
  const [viewport, setViewport] = useState({ width: 0, height: 0 })
  const [time, setTime] = useState({ utc: '', local: '', unix: 0 })
  const [browserInfo, setBrowserInfo] = useState('Client')

  useEffect(() => {
    setMounted(true)

    // Detect browser
    const ua = navigator.userAgent
    if (ua.includes('Firefox')) setBrowserInfo('Firefox')
    else if (ua.includes('Edg')) setBrowserInfo('MS Edge')
    else if (ua.includes('Chrome')) setBrowserInfo('Google Chrome')
    else if (ua.includes('Safari')) setBrowserInfo('Safari')
    else setBrowserInfo('Terminal')

    const updateDimensions = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    const updateClock = () => {
      const now = new Date()
      setTime({
        utc: now.toISOString().slice(11, 19),
        local: now.toTimeString().slice(0, 8),
        unix: Math.floor(now.getTime() / 1000)
      })
    }

    updateDimensions()
    updateClock()

    window.addEventListener('resize', updateDimensions)
    const timer = setInterval(updateClock, 1000)

    return () => {
      window.removeEventListener('resize', updateDimensions)
      clearInterval(timer)
    }
  }, [])

  if (!mounted) return null

  return (
    <footer
      aria-label="System telemetry"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 hidden border-t border-border/60 bg-background/80 px-4 py-2 font-mono text-[10px] tracking-wider text-muted-foreground uppercase backdrop-blur-xs select-none sm:block lg:px-8"
    >
      <div className="mx-auto flex w-full max-w-[90rem] items-center justify-between">
        {/* Left Telemetry */}
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="size-2 border border-foreground/60" />
            <span>CLIENT: {browserInfo}</span>
          </span>
          <span className="text-border">/</span>
          <span>
            VIEWPORT: {viewport.width}x{viewport.height}
          </span>
          <span className="hidden text-border md:inline">/</span>
          <span className="hidden md:inline">DEPTH: 24BIT</span>
        </div>

        {/* Right Telemetry */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline">UTC: {time.utc}</span>
          <span className="hidden sm:inline text-border">/</span>
          <span>LOCAL: {time.local}</span>
          <span className="hidden md:inline text-border">/</span>
          <span className="hidden md:inline">UNIX: {time.unix}</span>
          <span className="text-border">/</span>
          <span className="flex items-center gap-1.5 font-bold text-foreground">
            <span className="size-1.5 rounded-full bg-foreground animate-pulse" />
            STATUS: ACTIVE
          </span>
        </div>
      </div>
    </footer>
  )
}

export default HudFooter
