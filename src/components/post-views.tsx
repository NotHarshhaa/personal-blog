'use client'

import { Eye } from 'lucide-react'
import { useEffect, useState } from 'react'

import { cn } from '@/utils'

type PostViewsProps = {
  postId: string
  initialViews?: number
  className?: string
}

const hasViewMark = (key: string) => {
  try {
    return sessionStorage.getItem(key) === 'true'
  } catch {
    return false
  }
}

const updateViewMark = (key: string, viewed: boolean) => {
  try {
    if (viewed) sessionStorage.setItem(key, 'true')
    else sessionStorage.removeItem(key)
  } catch {
    // Storage is best-effort; view tracking should continue without it.
  }
}

const PostViews = ({ postId, initialViews, className }: PostViewsProps) => {
  const [views, setViews] = useState<number | null>(initialViews ?? null)
  const [isLoading, setIsLoading] = useState(initialViews == null)

  useEffect(() => {
    const viewedKey = `viewed-${postId}`
    let cancelled = false

    const trackView = async () => {
      const hasViewed = hasViewMark(viewedKey)
      if (!hasViewed) updateViewMark(viewedKey, true)

      try {
        const response = await fetch(`/api/posts/${postId}/views`, {
          method: hasViewed ? 'GET' : 'POST',
          cache: 'no-store'
        })

        if (!response.ok) {
          if (!hasViewed) updateViewMark(viewedKey, false)
          return
        }

        const data = (await response.json()) as { views: number }
        if (!cancelled && Number.isSafeInteger(data.views) && data.views >= 0) {
          setViews(data.views)
        }
      } catch (error) {
        if (!hasViewed) updateViewMark(viewedKey, false)
        console.error('Error tracking view:', error)
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    trackView()

    return () => {
      cancelled = true
    }
  }, [postId])

  if (isLoading || views === null) {
    return (
      <div className={cn('text-muted-foreground flex items-center gap-1 text-sm', className)}>
        <Eye className='size-4' />
        <span>...</span>
      </div>
    )
  }

  return (
    <div className={cn('text-muted-foreground flex items-center gap-1 text-sm', className)}>
      <Eye className='size-4' />
      <span>{views.toLocaleString()} views</span>
    </div>
  )
}

export default PostViews
