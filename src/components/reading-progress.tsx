'use client'

import { useEffect, useState } from 'react'

export const ReadingProgress = () => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let animationFrameId: number

    const updateProgress = () => {
      const { scrollY } = globalThis
      const { scrollHeight, clientHeight } = document.documentElement
      const totalScrollable = scrollHeight - clientHeight

      if (totalScrollable <= 0) {
        setProgress(0)
        return
      }

      const currentProgress = Math.min(
        100,
        Math.max(0, (scrollY / totalScrollable) * 100)
      )
      setProgress(currentProgress)
    }

    const onScroll = () => {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = requestAnimationFrame(updateProgress)
    }

    globalThis.addEventListener('scroll', onScroll, { passive: true })
    globalThis.addEventListener('resize', onScroll, { passive: true })
    updateProgress()

    return () => {
      cancelAnimationFrame(animationFrameId)
      globalThis.removeEventListener('scroll', onScroll)
      globalThis.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
      aria-label="Article reading progress"
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px] w-full bg-transparent"
    >
      <div
        className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 shadow-[0_0_8px_rgba(6,182,212,0.6)] transition-[width] duration-75 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

export default ReadingProgress
