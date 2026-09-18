'use client'

import { useCallback, useEffect, useRef } from 'react'
import { toast } from 'sonner'

type ReadingResumeProps = {
  postId: string
}

const STORAGE_KEY = 'reading_progress_v1'
const MIN_PROGRESS = 0.05
const MAX_PROGRESS = 0.95
const SAVE_INTERVAL_MS = 2000

type ProgressData = {
  [postId: string]: {
    progress: number
    timestamp: number
    title?: string
  }
}

const getStoredProgress = (): ProgressData => {
  try {
    const stored = globalThis.localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as unknown
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed as ProgressData
      }
    }
  } catch {
    // Ignore storage errors
  }
  return {}
}

const saveProgress = (postId: string, progress: number) => {
  try {
    const data = getStoredProgress()

    if (progress >= MAX_PROGRESS) {
      // Post is fully read, remove progress
      delete data[postId]
    } else if (progress >= MIN_PROGRESS) {
      data[postId] = {
        progress,
        timestamp: Date.now()
      }
    }

    // Clean up old entries (older than 30 days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
    for (const key of Object.keys(data)) {
      const entry = data[key]
      if (entry && entry.timestamp < thirtyDaysAgo) {
        delete data[key]
      }
    }

    globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Ignore storage errors
  }
}

const getScrollProgress = (): number => {
  const { scrollY } = globalThis
  const { scrollHeight, clientHeight } = document.documentElement
  const totalScrollable = scrollHeight - clientHeight

  if (totalScrollable <= 0) return 0
  return Math.min(1, Math.max(0, scrollY / totalScrollable))
}

export const ReadingResume = ({ postId }: ReadingResumeProps) => {
  const hasShownToast = useRef(false)
  const lastSaved = useRef(0)

  // Show resume toast on mount
  useEffect(() => {
    if (hasShownToast.current) return

    const data = getStoredProgress()
    const entry = data[postId]

    if (entry && entry.progress >= MIN_PROGRESS && entry.progress < MAX_PROGRESS) {
      hasShownToast.current = true

      const percent = Math.round(entry.progress * 100)

      // Small delay for a smooth UX after page load
      const timer = setTimeout(() => {
        toast(`Reading Progress: ${percent}%`, {
          description: 'Pick up where you left off?',
          action: {
            label: 'Resume',
            onClick: () => {
              const { scrollHeight, clientHeight } = document.documentElement
              const totalScrollable = scrollHeight - clientHeight
              const targetY = entry.progress * totalScrollable

              globalThis.scrollTo({
                top: targetY,
                behavior: 'smooth'
              })
            }
          },
          duration: 8000
        })
      }, 1200)

      return () => clearTimeout(timer)
    }

    return undefined
  }, [postId])

  // Save scroll position periodically
  const handleScroll = useCallback(() => {
    const now = Date.now()
    if (now - lastSaved.current < SAVE_INTERVAL_MS) return

    lastSaved.current = now
    const progress = getScrollProgress()
    saveProgress(postId, progress)
  }, [postId])

  useEffect(() => {
    globalThis.addEventListener('scroll', handleScroll, { passive: true })

    // Save on page unload
    const handleUnload = () => {
      const progress = getScrollProgress()
      saveProgress(postId, progress)
    }

    globalThis.addEventListener('beforeunload', handleUnload)

    return () => {
      globalThis.removeEventListener('scroll', handleScroll)
      globalThis.removeEventListener('beforeunload', handleUnload)

      // Final save on unmount
      const progress = getScrollProgress()
      saveProgress(postId, progress)
    }
  }, [postId, handleScroll])

  return null
}

export default ReadingResume
